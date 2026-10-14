export function PageShell({ eyebrow, title, description, children }) {
  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-6 p-4 sm:p-6 xl:p-8">
      <section>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-4 text-3xl font-black uppercase leading-none text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#b9b9b9] sm:text-base">
            {description}
          </p>
        )}
      </section>

      {children}
    </div>
  );
}

export function AdminSection({
  eyebrow,
  title,
  action,
  onAction,
  actionDisabled = false,
  children,
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#151515] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e71921]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-black uppercase text-white">
            {title}
          </h2>
        </div>

        {action && (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e71921] bg-[#e71921] px-4 text-xs font-black uppercase text-white shadow-[0_14px_32px_rgba(231,25,33,0.22)] transition hover:border-[#ff2a33] hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {action}
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

export function SummaryCard({ item }) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#151515] p-5 transition hover:-translate-y-1 hover:border-[#e71921]/45">
      <p className="text-sm font-bold text-[#b9b9b9]">{item.title}</p>
      <p className="mt-3 text-4xl font-black text-white">{item.value}</p>
      <p className="mt-2 text-xs font-bold leading-5 text-gray-500">
        {item.detail}
      </p>
    </article>
  );
}

export function DataRow({ title, meta, status }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const statusClass =
    normalizedStatus === "activo"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : normalizedStatus === "inactivo"
        ? "border-red-400/30 bg-red-400/10 text-red-300"
        : "border-white/10 bg-[#0f0f0f] text-[#b9b9b9]";

  return (
    <article className="grid gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-black text-white">{title}</p>
        <p className="mt-1 truncate text-xs font-bold text-gray-500">{meta}</p>
      </div>

      <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass}`}>
        {status}
      </span>
    </article>
  );
}

const statusClasses = {
  pendiente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  confirmado: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  finalizado: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

export function StatusBadge({ status = "pendiente" }) {
  const normalizedStatus = String(status).toLowerCase();

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase ${
        statusClasses[normalizedStatus] ||
        "border-white/10 bg-[#0f0f0f] text-[#b9b9b9]"
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

export function DetailCard({
  title,
  subtitle,
  status,
  fields = [],
  descriptionLabel = "Descripción",
  description,
  actions = [],
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-black text-white">{title}</h3>
          {subtitle && (
            <p className="mt-1 break-words text-xs font-bold text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <StatusBadge status={status} />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-white/5 bg-[#0f0f0f] p-3"
          >
            <dt className="text-[11px] font-black uppercase tracking-wider text-gray-500">
              {label}
            </dt>
            <dd className="mt-1 break-words text-sm font-bold text-[#dedede]">
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-lg border border-white/5 bg-[#0f0f0f] p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
          {descriptionLabel}
        </p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm font-bold leading-6 text-[#dedede]">
          {description || "Sin descripción adicional."}
        </p>
      </div>

      {actions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
          {actions.map(({ label, onClick, disabled, variant = "primary" }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={`min-h-10 rounded-lg border px-4 text-xs font-black uppercase transition disabled:cursor-not-allowed disabled:opacity-50 ${
                variant === "success"
                  ? "border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-400"
                  : "border-[#e71921] bg-[#e71921] text-white hover:bg-[#ff2a33]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
