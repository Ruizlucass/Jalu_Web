
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase.js";
import { panelConfigs } from "../data/adminData.js";
import {
  AdminSection,
  PageShell,
} from "../components/AdminUi.jsx";

const BUCKET = "menu-productos";

const CATEGORIES = [
  "Sfijas",
  "Kipes",
  "Shawarma",
  "Combos",
  "Dulces arabes",
];

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "Combos",
  imagen_url: "",
  disponible: true,
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#e71921]";

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);
}

export default function MenuProducts({ panelType = "admin" }) {
  const config = panelConfigs[panelType] || panelConfigs.admin;

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [availabilityFilter, setAvailabilityFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("menu_productos")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error(queryError);
      setError(
        "No se pudieron cargar los productos. Verificá la tabla y los permisos de Supabase."
      );
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setPreview("");
    setMessage("");
    setError("");

    const fileInput = document.getElementById("producto-imagen");
    if (fileInput) fileInput.value = "";
  }

  function startEditing(product) {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: String(product.precio ?? ""),
      categoria: product.categoria || "Combos",
      imagen_url: product.imagen_url || "",
      disponible: Boolean(product.disponible),
    });
    setImageFile(null);
    setPreview(product.imagen_url || "");
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setImageFile(null);

    if (!file) {
      setPreview(form.imagen_url || "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Seleccioná un archivo de imagen válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return form.imagen_url || null;

    const extension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const price = Number(form.precio);

      if (!form.nombre.trim()) {
        throw new Error("Ingresá el nombre del plato.");
      }

      if (!form.descripcion.trim()) {
        throw new Error("Ingresá una descripción para el plato.");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Ingresá un precio válido.");
      }

      if (!form.categoria) {
        throw new Error("Seleccioná una categoría.");
      }

      const imageUrl = await uploadImage();

      const productData = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: price,
        categoria: form.categoria,
        imagen_url: imageUrl,
        disponible: Boolean(form.disponible),
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editingId !== null) {
        result = await supabase
          .from("menu_productos")
          .update(productData)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("menu_productos")
          .insert(productData);
      }

      if (result.error) throw result.error;

      setMessage(
        editingId !== null
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );

      resetForm();
      setMessage(
        editingId !== null
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );

      await loadProducts();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product) {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("menu_productos")
      .update({
        disponible: !product.disponible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (updateError) {
      console.error(updateError);
      setError(
        "No se pudo cambiar la disponibilidad. Revisá los permisos de Supabase."
      );
      return;
    }

    setMessage(
      product.disponible
        ? "Producto desactivado: ya no se mostrará en el menú público."
        : "Producto activado: volverá a mostrarse en el menú público."
    );

    await loadProducts();
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `¿Querés eliminar definitivamente "${product.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("menu_productos")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      console.error(deleteError);
      setError("No se pudo eliminar el producto.");
      return;
    }

    if (editingId === product.id) resetForm();

    setMessage("Producto eliminado correctamente.");
    await loadProducts();
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [
      product.nombre,
      product.descripcion,
      product.categoria,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "Todas" ||
      product.categoria === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "Todas" ||
      (availabilityFilter === "Disponibles" && product.disponible) ||
      (availabilityFilter === "Agotados" && !product.disponible);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <PageShell
      eyebrow={config.label}
      title="Productos del menú"
      description="Creá y administrá los platos de Jalu. Los productos disponibles aparecerán en el menú público."
    >
      {message && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-300"
        >
          {error}
        </div>
      )}

      <AdminSection
        eyebrow={editingId !== null ? "Editar producto" : "Nuevo plato"}
        title={
          editingId !== null
            ? "Modificar plato"
            : "Crear tu propio plato"
        }
        action={editingId !== null ? "Cancelar edición" : undefined}
        onAction={resetForm}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid content-start gap-4">
              <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                Nombre del plato *
                <input
                  className={inputClass}
                  value={form.nombre}
                  onChange={(event) =>
                    setForm({ ...form, nombre: event.target.value })
                  }
                  placeholder="Ej.: Shawarma especial Jalu"
                  maxLength={100}
                  required
                />
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                Descripción *
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  value={form.descripcion}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      descripcion: event.target.value,
                    })
                  }
                  placeholder="Contá qué incluye el plato..."
                  maxLength={500}
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                  Precio (ARS) *
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(event) =>
                      setForm({ ...form, precio: event.target.value })
                    }
                    placeholder="7900"
                    required
                  />
                </label>

                <label className="grid gap-2 text-xs font-black uppercase text-gray-400">
                  Categoría *
                  <select
                    className={inputClass}
                    value={form.categoria}
                    onChange={(event) =>
                      setForm({ ...form, categoria: event.target.value })
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#e71921]"
                  checked={form.disponible}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      disponible: event.target.checked,
                    })
                  }
                />
                <span>
                  <span className="block text-sm font-black text-white">
                    Producto disponible
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Si lo desactivás, no aparecerá en el menú público.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid content-start gap-3">
              <span className="text-xs font-black uppercase text-gray-400">
                Foto de presentación
              </span>

              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/30">
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa del plato"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-gray-600">
                    <span className="text-4xl">＋</span>
                    <p className="mt-3 text-xs font-bold">
                      La foto del plato aparecerá aquí
                    </p>
                  </div>
                )}
              </div>

              <label
                htmlFor="producto-imagen"
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-black uppercase text-white transition hover:border-[#e71921]"
              >
                Seleccionar imagen
              </label>

              <input
                id="producto-imagen"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />

              <p className="text-xs leading-5 text-gray-500">
                Formatos de imagen habituales. Tamaño máximo: 5 MB.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-lg bg-[#e71921] px-6 text-xs font-black uppercase text-white transition hover:bg-[#ff2a33] disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editingId !== null
                  ? "Guardar cambios"
                  : "Crear plato"}
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
        eyebrow="Catálogo"
        title={`Productos registrados (${filteredProducts.length})`}
      >
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar plato..."
            aria-label="Buscar productos"
          />

          <select
            className={inputClass}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className={inputClass}
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            aria-label="Filtrar por disponibilidad"
          >
            <option value="Todas">Todos los productos</option>
            <option value="Disponibles">Disponibles</option>
            <option value="Agotados">Agotados / desactivados</option>
          </select>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm font-bold text-gray-500">
            Cargando productos...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="rounded-lg border border-white/10 p-6 text-center text-sm font-bold text-gray-500">
            No hay productos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#101010]"
              >
                <div className="aspect-[4/3] bg-black/40">
                  {product.imagen_url ? (
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-600">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-black text-white">
                        {product.nombre}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-gray-500">
                        {product.categoria}
                      </p>
                    </div>

                    <span className="shrink-0 font-black text-[#e71921]">
                      {formatPrice(product.precio)}
                    </span>
                  </div>

                  <p className="line-clamp-3 min-h-12 text-sm leading-5 text-gray-400">
                    {product.descripcion || "Sin descripción."}
                  </p>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                      product.disponible
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {product.disponible ? "Disponible" : "Desactivado"}
                  </span>

                  <button
                    type="button"
                    onClick={() => startEditing(product)}
                    className="min-h-10 rounded-lg border border-white/15 px-4 text-xs font-black uppercase text-white hover:border-[#e71921]"
                  >
                    Editar plato
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAvailability(product)}
                    className="min-h-10 rounded-lg border border-[#e71921]/50 px-4 text-xs font-black uppercase text-[#ff6b70] hover:bg-[#e71921]/10"
                  >
                    {product.disponible
                      ? "Desactivar por falta de stock"
                      : "Volver a publicar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-gray-400 hover:border-red-500 hover:text-red-300"
                  >
                    Eliminar definitivamente
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminSection>
    </PageShell>
  );
}
