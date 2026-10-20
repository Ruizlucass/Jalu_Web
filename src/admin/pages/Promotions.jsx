import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase.js";
import { panelConfigs } from "../data/adminData.js";
import { AdminSection, PageShell } from "../components/AdminUi.jsx";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#e71921]";

const AVAILABLE_BRANCHES = ["Yerba Buena", "Centro", "Otra sucursal"];

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function getInitialForm() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return {
    titulo: "",
    descripcion: "",
    tipo_descuento: "porcentaje",
    valor_descuento: "",
    fecha_inicio: toLocalDateTime(start),
    fecha_fin: toLocalDateTime(end),
    aplica_todas_sucursales: true,
    sucursales_aplicables: [],
    activa: true,
  };
}

function formatDateTime(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDiscount(promotion) {
  const value = Number(promotion.valor_descuento || 0);
  if (promotion.tipo_descuento === "monto_fijo") {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}%`;
}

function getPromotionStatus(promotion, now = Date.now()) {
  if (!promotion.activa) return "Pausada";
  const start = new Date(promotion.fecha_inicio).getTime();
  const end = new Date(promotion.fecha_fin).getTime();
  if (now < start) return "Programada";
  if (now >= end) return "Vencida";
  return "Activa";
}

export default function Promotions({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(getInitialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("promociones")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Error cargando ofertas:", queryError);
      setError(
        "No se pudieron cargar las ofertas. Ejecutá el archivo supabase-promotions.sql en Supabase y revisá los permisos."
      );
      setLoading(false);
      return;
    }

    setPromotions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  function resetForm() {
    setForm(getInitialForm());
    setEditingId(null);
    setMessage("");
    setError("");
  }

  function startEditing(promotion) {
    setEditingId(promotion.id);
    setForm({
      titulo: promotion.titulo || "",
      descripcion: promotion.descripcion || "",
      tipo_descuento: promotion.tipo_descuento || "porcentaje",
      valor_descuento: String(promotion.valor_descuento ?? ""),
      fecha_inicio: toLocalDateTime(promotion.fecha_inicio),
      fecha_fin: toLocalDateTime(promotion.fecha_fin),
      aplica_todas_sucursales: promotion.aplica_todas_sucursales !== false,
      sucursales_aplicables: promotion.sucursales_aplicables || [],
      activa: Boolean(promotion.activa),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const discount = Number(form.valor_descuento);
      const start = new Date(form.fecha_inicio);
      const end = new Date(form.fecha_fin);

      if (!form.titulo.trim()) throw new Error("Ingresá el nombre de la oferta.");
      if (!Number.isFinite(discount) || discount <= 0) {
        throw new Error("Ingresá un descuento mayor a cero.");
      }
      if (form.tipo_descuento === "porcentaje" && discount > 100) {
        throw new Error("El descuento porcentual no puede superar el 100%.");
      }
      if (!form.fecha_inicio || !form.fecha_fin || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error("Elegí una fecha de inicio y una fecha de vencimiento.");
      }
      if (end <= start) {
        throw new Error("La fecha de vencimiento debe ser posterior al inicio.");
      }
      if (
        !form.aplica_todas_sucursales &&
        form.sucursales_aplicables.length === 0
      ) {
        throw new Error("Elegí al menos una sucursal para esta oferta.");
      }

      const now = new Date().toISOString();
      const promotionData = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo_descuento: form.tipo_descuento,
        valor_descuento: discount,
        fecha_inicio: start.toISOString(),
        fecha_fin: end.toISOString(),
        aplica_todas_sucursales: form.aplica_todas_sucursales,
        sucursales_aplicables: form.aplica_todas_sucursales
          ? []
          : form.sucursales_aplicables,
        activa: Boolean(form.activa),
        updated_at: now,
      };

      const result = editingId !== null
        ? await supabase.from("promociones").update(promotionData).eq("id", editingId)
        : await supabase.from("promociones").insert({ ...promotionData, created_at: now });

      if (result.error) throw result.error;

      setMessage(editingId !== null ? "Oferta actualizada correctamente." : "Oferta creada correctamente.");
      resetForm();
      setMessage(editingId !== null ? "Oferta actualizada correctamente." : "Oferta creada correctamente.");
      await loadPromotions();
    } catch (saveError) {
      console.error("Error guardando oferta:", saveError);
      setError(saveError.message || "No se pudo guardar la oferta.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePromotion(promotion) {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("promociones")
      .update({ activa: !promotion.activa, updated_at: new Date().toISOString() })
      .eq("id", promotion.id);

    if (updateError) {
      console.error("Error cambiando estado de la oferta:", updateError);
      setError("No se pudo cambiar el estado de la oferta.");
      return;
    }

    setMessage(promotion.activa ? "Oferta pausada." : "Oferta activada.");
    await loadPromotions();
  }

  async function deletePromotion(promotion) {
    const confirmed = window.confirm(
      `¿Querés eliminar definitivamente “${promotion.titulo}”? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setError("");
    setMessage("");
    const { error: deleteError } = await supabase
      .from("promociones")
      .delete()
      .eq("id", promotion.id);

    if (deleteError) {
      console.error("Error eliminando oferta:", deleteError);
      setError("No se pudo eliminar la oferta.");
      return;
    }

    if (editingId === promotion.id) resetForm();
    setMessage("Oferta eliminada correctamente.");
    await loadPromotions();
  }

  const filteredPromotions = useMemo(() => promotions.filter((promotion) => {
    const searchText = `${promotion.titulo} ${promotion.descripcion || ""}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    const status = getPromotionStatus(promotion);
    const matchesStatus = statusFilter === "Todas" || status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [promotions, search, statusFilter]);

  return (
    <PageShell
      eyebrow={config.label}
      title="Ofertas y promociones"
      description="Creá ofertas con descuentos y definí cuándo empiezan y vencen."
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
        title={editingId !== null ? "Modificar promoción" : "Crear una promoción"}
        action={editingId !== null ? "Cancelar edición" : undefined}
        onAction={resetForm}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
              Nombre de la oferta *
              <input
                className={inputClass}
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                placeholder="Ej.: 2 shawarmas + bebida"
                maxLength={120}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                Tipo de descuento *
                <select
                  className={inputClass}
                  value={form.tipo_descuento}
                  onChange={(event) => setForm({ ...form, tipo_descuento: event.target.value })}
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto_fijo">Monto fijo (ARS)</option>
                </select>
              </label>
              <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                {form.tipo_descuento === "porcentaje" ? "Descuento (%) *" : "Descuento (ARS) *"}
                <input
                  className={inputClass}
                  type="number"
                  min="0.01"
                  max={form.tipo_descuento === "porcentaje" ? "100" : undefined}
                  step="0.01"
                  value={form.valor_descuento}
                  onChange={(event) => setForm({ ...form, valor_descuento: event.target.value })}
                  placeholder={form.tipo_descuento === "porcentaje" ? "20" : "1500"}
                  required
                />
              </label>
            </div>
          </div>

          <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
            Descripción
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
              placeholder="Detalles y condiciones de la oferta..."
              maxLength={500}
            />
          </label>

          <fieldset className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
            <legend className="px-2 text-xs font-black uppercase tracking-wider text-gray-400">
              Sucursales donde aplica
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                form.aplica_todas_sucursales
                  ? "border-[#e71921]/50 bg-[#e71921]/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20"
              }`}>
                <input
                  type="radio"
                  name="alcance-oferta"
                  checked={form.aplica_todas_sucursales}
                  onChange={() => setForm({
                    ...form,
                    aplica_todas_sucursales: true,
                    sucursales_aplicables: [],
                  })}
                  className="accent-[#e71921]"
                />
                Todas las sucursales
              </label>
              <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                !form.aplica_todas_sucursales
                  ? "border-[#e71921]/50 bg-[#e71921]/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20"
              }`}>
                <input
                  type="radio"
                  name="alcance-oferta"
                  checked={!form.aplica_todas_sucursales}
                  onChange={() => setForm({ ...form, aplica_todas_sucursales: false })}
                  className="accent-[#e71921]"
                />
                Sucursales específicas
              </label>
            </div>

            {!form.aplica_todas_sucursales && (
              <div className="grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2">
                {AVAILABLE_BRANCHES.map((branch) => (
                  <label key={branch} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm font-bold text-gray-300 hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={form.sucursales_aplicables.includes(branch)}
                      onChange={(event) => {
                        const selectedBranches = event.target.checked
                          ? [...form.sucursales_aplicables, branch]
                          : form.sucursales_aplicables.filter((item) => item !== branch);
                        setForm({ ...form, sucursales_aplicables: selectedBranches });
                      }}
                      className="h-4 w-4 accent-[#e71921]"
                    />
                    {branch}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
              Válida desde *
              <input
                className={inputClass}
                type="datetime-local"
                value={form.fecha_inicio}
                onChange={(event) => setForm({ ...form, fecha_inicio: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
              Válida hasta *
              <input
                className={inputClass}
                type="datetime-local"
                min={form.fecha_inicio || undefined}
                value={form.fecha_fin}
                onChange={(event) => setForm({ ...form, fecha_fin: event.target.value })}
                required
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#e71921]"
              checked={form.activa}
              onChange={(event) => setForm({ ...form, activa: event.target.checked })}
            />
            <span className="text-sm font-black text-white">Oferta habilitada</span>
          </label>

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

      <AdminSection eyebrow="Catálogo" title={`Ofertas registradas (${filteredPromotions.length})`} action="Actualizar" onAction={loadPromotions} actionDisabled={loading}>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar oferta..."
            aria-label="Buscar ofertas"
          />
          <select
            className={inputClass}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar ofertas por estado"
          >
            <option value="Todas">Todos los estados</option>
            <option value="Activa">Activas</option>
            <option value="Programada">Programadas</option>
            <option value="Vencida">Vencidas</option>
            <option value="Pausada">Pausadas</option>
          </select>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm font-bold text-gray-500">Cargando ofertas...</p>
        ) : filteredPromotions.length === 0 ? (
          <p className="rounded-lg border border-white/10 p-6 text-center text-sm font-bold text-gray-500">
            Todavía no hay ofertas que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPromotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              return (
                <article key={promotion.id} className="grid content-start gap-4 rounded-xl border border-white/10 bg-[#101010] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-black text-white">{promotion.titulo}</h3>
                      <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                        status === "Activa"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : status === "Programada"
                            ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                            : status === "Vencida"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              : "border-white/10 bg-white/5 text-gray-400"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <strong className="shrink-0 text-lg font-black text-[#e71921]">
                      {formatDiscount(promotion)}
                    </strong>
                  </div>

                  <p className="min-h-10 whitespace-pre-wrap break-words text-sm leading-5 text-gray-400">
                    {promotion.descripcion || "Sin descripción."}
                  </p>

                  <dl className="grid gap-2 rounded-lg border border-white/5 bg-black/20 p-3 text-xs">
                    <div className="flex flex-wrap justify-between gap-1">
                      <dt className="font-bold text-gray-500">Sucursales</dt>
                      <dd className="text-right text-gray-300">
                        {promotion.aplica_todas_sucursales === false
                          ? (promotion.sucursales_aplicables || []).join(", ")
                          : "Todas"}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1">
                      <dt className="font-bold text-gray-500">Desde</dt>
                      <dd className="text-right text-gray-300">{formatDateTime(promotion.fecha_inicio)}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1">
                      <dt className="font-bold text-gray-500">Hasta</dt>
                      <dd className="text-right text-gray-300">{formatDateTime(promotion.fecha_fin)}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => startEditing(promotion)}
                    className="min-h-10 rounded-lg border border-white/15 px-4 text-xs font-black uppercase text-white transition hover:border-[#e71921]"
                  >
                    Editar oferta
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePromotion(promotion)}
                    className="min-h-10 rounded-lg border border-[#e71921]/50 px-4 text-xs font-black uppercase text-[#ff6b70] transition hover:bg-[#e71921]/10"
                  >
                    {promotion.activa ? "Pausar oferta" : "Activar oferta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePromotion(promotion)}
                    className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-gray-400 transition hover:border-red-500 hover:text-red-300"
                  >
                    Eliminar definitivamente
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </AdminSection>
    </PageShell>
  );
}
