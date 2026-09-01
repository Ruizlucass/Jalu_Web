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

export function AdminSection({ eyebrow, title, action, children }) {
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
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e71921] bg-[#e71921] px-4 text-xs font-black uppercase text-white shadow-[0_14px_32px_rgba(231,25,33,0.22)] transition hover:border-[#ff2a33] hover:bg-[#ff2a33]"
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
  return (
    <article className="grid gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-black text-white">{title}</p>
        <p className="mt-1 truncate text-xs font-bold text-gray-500">{meta}</p>
      </div>

      <span className="w-fit rounded-full border border-white/10 bg-[#0f0f0f] px-3 py-1 text-xs font-black uppercase text-[#b9b9b9]">
        {status}
      </span>
    </article>
  );
}
