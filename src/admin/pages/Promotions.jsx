import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase.js";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, PageShell } from "../components/AdminUi.jsx";

const BUCKET = "menu-productos";
const TABLE = "banners_menu";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-[#e71921] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:text-white focus:border-[#e71921]";

function toDateInputValue(value) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return toDateInputValue(date);
}

function toStartOfDayISOString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

function toEndOfDayISOString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

function formatDate(value) {
  if (!value) return "Sin fecha límite";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
    new Date(value)
  );
}

export default function Promotions({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [startDate, setStartDate] = useState(() => toDateInputValue());
  const [expirationDate, setExpirationDate] = useState(getDefaultExpirationDate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from(TABLE)
      .select("id, imagen_url, fecha_inicio, fecha_limite, created_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Error cargando ofertas:", queryError);
      setError(
        "No se pudieron cargar las ofertas. Revisá que la tabla banners_menu esté creada en Supabase."
      );
      setLoading(false);
      return;
    }

    setBanners(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function resetForm() {
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setStartDate(toDateInputValue());
    setExpirationDate(getDefaultExpirationDate());
    setMessage("");
    setError("");
  }

  function startEditing(banner) {
    setEditingId(banner.id);
    setImageFile(null);
    setImagePreview(banner.imagen_url);
    setStartDate(toDateInputValue(banner.fecha_inicio));
    setExpirationDate(toDateInputValue(banner.fecha_limite));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setError("");

    if (!file) {
      setImageFile(null);
      setImagePreview(editingId ? imagePreview : "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageFile(null);
      setError("Seleccioná un archivo de imagen.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageFile(null);
      setError("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!imageFile && editingId === null) {
      setError("Seleccioná una imagen para crear la oferta.");
      return;
    }

    if (!startDate || !expirationDate) {
      setError("Elegí desde cuándo y hasta cuándo estará habilitada la oferta.");
      return;
    }

    if (expirationDate < startDate) {
      setError("La fecha Hasta debe ser igual o posterior a la fecha Desde.");
      return;
    }

    setSaving(true);

    try {
      const wasEditing = editingId !== null;
      let imageUrl = imagePreview;

      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
        const filePath = `banners-menu/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const result =
        editingId !== null
          ? await supabase
              .from(TABLE)
              .update({
                imagen_url: imageUrl,
                fecha_inicio: toStartOfDayISOString(startDate),
                fecha_limite: toEndOfDayISOString(expirationDate),
                updated_at: new Date().toISOString(),
              })
              .eq("id", editingId)
          : await supabase.from(TABLE).insert({
              imagen_url: imageUrl,
              fecha_inicio: toStartOfDayISOString(startDate),
              fecha_limite: toEndOfDayISOString(expirationDate),
            });

      if (result.error) throw result.error;

      resetForm();
      setMessage(
        wasEditing
          ? "Oferta actualizada correctamente."
          : "Oferta creada correctamente."
      );
      await loadBanners();
    } catch (saveError) {
      console.error("Error guardando oferta:", saveError);
      setError(saveError.message || "No se pudo guardar la oferta.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(banner) {
    if (!window.confirm("¿Querés eliminar esta oferta?")) return;

    setError("");
    setMessage("");
    const { error: deleteError } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", banner.id);

    if (deleteError) {
      console.error("Error eliminando oferta:", deleteError);
      setError("No se pudo eliminar la oferta.");
      return;
    }

    if (editingId === banner.id) resetForm();
    setMessage("Oferta eliminada correctamente.");
    await loadBanners();
  }

  return (
    <PageShell
      eyebrow={config.label}
      title="Ofertas"
    >
      {message && (
        <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-300">
          {error}
        </div>
      )}

      <AdminSection
        eyebrow={editingId !== null ? "Editar oferta" : "Nueva oferta"}
        title={editingId !== null ? "Actualizar oferta" : "Crear una oferta"}
        action={editingId !== null ? "Cancelar edición" : undefined}
        onAction={resetForm}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
            Imagen de la oferta * (máximo 5 MB)
            <input
              className={inputClass}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={editingId === null}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
              Desde *
              <input
                className={inputClass}
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
              <span className="text-xs font-medium normal-case text-gray-500">
                Se habilita desde el inicio de este día.
              </span>
            </label>

            <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
              Hasta *
              <input
                className={inputClass}
                type="date"
                min={startDate || undefined}
                value={expirationDate}
                onChange={(event) => setExpirationDate(event.target.value)}
                required
              />
              <span className="text-xs font-medium normal-case text-gray-500">
                Se deshabilita al terminar este día.
              </span>
            </label>
          </div>

          {imagePreview && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img
                src={imagePreview}
                alt="Vista previa de la imagen de la oferta"
                className="max-h-[55vh] w-full object-contain"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-lg bg-[#e71921] px-6 text-xs font-black uppercase text-white transition hover:bg-[#ff2a33] disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId !== null ? "Guardar cambios" : "Crear oferta"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-11 rounded-lg border border-white/15 px-6 text-xs font-black uppercase text-white hover:bg-white/5"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </AdminSection>

      <AdminSection
        eyebrow="Ofertas"
        title={`Ofertas registradas (${banners.length})`}
        action="Actualizar"
        onAction={loadBanners}
        actionDisabled={loading}
      >
        {loading ? (
          <p className="py-8 text-center text-sm font-bold text-gray-500">Cargando ofertas...</p>
        ) : banners.length === 0 ? (
          <p className="rounded-lg border border-white/10 p-6 text-center text-sm font-bold text-gray-500">
            Todavía no hay ofertas cargadas.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => (
              <article key={banner.id} className="grid content-start gap-3 rounded-xl border border-white/10 bg-[#101010] p-3">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black/40">
                  <img src={banner.imagen_url} alt="Imagen de la oferta" className="h-full w-full object-contain" />
                </div>
                <p className="text-sm font-bold text-gray-300">
                  {new Date(banner.fecha_inicio) > new Date() ? (
                    <span className="text-sky-300">Programada</span>
                  ) : new Date(banner.fecha_limite) <= new Date() ? (
                    <span className="text-amber-300">Vencida</span>
                  ) : (
                    <span className="text-emerald-300">Habilitada</span>
                  )}
                  <span className="mt-1 block text-xs font-medium text-gray-400">
                    Desde {formatDate(banner.fecha_inicio)} · Hasta {formatDate(banner.fecha_limite)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => startEditing(banner)}
                  className="min-h-10 rounded-lg border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#e71921]"
                >
                  Editar oferta
                </button>
                <button
                  type="button"
                  onClick={() => deleteBanner(banner)}
                  className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-gray-400 transition hover:border-red-500 hover:text-red-300"
                >
                  Eliminar oferta
                </button>
              </article>
            ))}
          </div>
        )}
      </AdminSection>
    </PageShell>
  );
}
