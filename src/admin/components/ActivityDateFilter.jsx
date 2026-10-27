import { useEffect, useState } from "react";

export function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateString(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function activityRangeBounds(period, date, rangeEnd = date) {
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const [endYear, endMonth, endDay] = rangeEnd.split("-").map(Number);
  const end = new Date(endYear, endMonth - 1, endDay + 1);

  if (period === "week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else if (period === "month") {
    start.setDate(1);
    end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
  } else if (period !== "range") {
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 1);
  } else if (end < start) {
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 1);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: localDateString(start),
    endDate: localDateString(end),
    throughDate: localDateString(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1)),
  };
}

export function useActivityDate() {
  const [date, setDate] = useState(todayLocalDate);
  const [period, setPeriod] = useState("day");
  const [rangeEnd, setRangeEnd] = useState(todayLocalDate);

  useEffect(() => {
    let timer;
    const updateAtMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      timer = window.setTimeout(() => {
        setDate(todayLocalDate());
        setRangeEnd(todayLocalDate());
        setPeriod("day");
        updateAtMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };

    updateAtMidnight();
    return () => window.clearTimeout(timer);
  }, []);

  return [date, setDate, period, setPeriod, rangeEnd, setRangeEnd];
}

export function ActivityDateFilter({ fromDate, toDate, period, onPeriodChange }) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [draftFromDate, setDraftFromDate] = useState(fromDate);
  const [draftToDate, setDraftToDate] = useState(toDate);
  const maxDate = todayLocalDate();
  const periods = [
    { id: "day", label: "Día" },
    { id: "week", label: "Semana" },
    { id: "month", label: "Mes" },
    { id: "range", label: "Rango" },
  ];
  const selectedRange = activityRangeBounds(period, fromDate, toDate);
  const formatDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("es-AR").format(new Date(year, month - 1, day, 12));
  };

  useEffect(() => {
    if (!rangeOpen) {
      setDraftFromDate(fromDate);
      setDraftToDate(toDate);
    }
  }, [fromDate, toDate, rangeOpen]);

  function openRange() {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setRangeOpen(true);
  }

  function closeRange() {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setRangeOpen(false);
  }

  function applyRange() {
    if (
      !draftFromDate ||
      !draftToDate ||
      draftToDate < draftFromDate ||
      draftToDate > maxDate
    ) return;
    onPeriodChange("range", draftFromDate, draftToDate);
    setRangeOpen(false);
  }

  return (
    <div className="relative z-10 min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
            Período rápido
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {periods.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === "range" ? rangeOpen || period === id : period === id}
                onClick={() => {
                  if (id === "range") openRange();
                  else {
                    setRangeOpen(false);
                    onPeriodChange(id);
                  }
                }}
                className={`min-h-11 rounded-xl border px-4 text-xs font-black uppercase transition duration-200 hover:-translate-y-0.5 ${
                  period === id || (id === "range" && rangeOpen)
                    ? "border-[#e71921]/50 bg-gradient-to-r from-[#e71921] to-[#b90e16] text-white shadow-[0_8px_20px_rgba(231,25,33,0.18)]"
                    : "border-white/[0.08] bg-[#0f0f0f] text-[#aaa] hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs font-bold text-neutral-400 sm:text-right" aria-live="polite">
          {period === "range"
            ? `Rango aplicado: ${formatDate(selectedRange.startDate)} – ${formatDate(selectedRange.throughDate)}`
            : selectedRange.startDate === selectedRange.throughDate
            ? `Fecha: ${formatDate(selectedRange.startDate)}`
            : `${formatDate(selectedRange.startDate)} – ${formatDate(selectedRange.throughDate)}`}
        </p>
      </div>
      {rangeOpen && (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 grid w-full gap-3 rounded-xl border border-white/15 bg-[#151515] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.65)] sm:left-auto sm:right-0 sm:max-w-[520px] sm:grid-cols-2"
          role="group"
          aria-label="Elegir rango de fechas"
        >
          <label className="grid min-w-0 gap-2 text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
            Desde
            <input
              type="date"
              value={draftFromDate}
              onChange={(event) => {
                const nextFromDate = event.target.value || todayLocalDate();
                setDraftFromDate(nextFromDate);
              }}
              className="min-h-11 w-full min-w-0 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold normal-case tracking-normal text-white [color-scheme:dark] focus:border-[#e71921] focus:outline-none"
            />
          </label>
          <label className="grid min-w-0 gap-2 text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
            Hasta
            <input
              type="date"
              value={draftToDate}
              min={draftFromDate}
              max={maxDate}
              onChange={(event) => setDraftToDate(event.target.value || draftFromDate)}
              className="min-h-11 w-full min-w-0 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold normal-case tracking-normal text-white [color-scheme:dark] focus:border-[#e71921] focus:outline-none"
            />
          </label>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <p className="text-xs font-medium normal-case tracking-normal text-neutral-500">
              Se incluirán ambas fechas en el rango.
            </p>
            <button
              type="button"
              onClick={closeRange}
              aria-label="Cerrar selector de rango"
              title="Cerrar"
              className="absolute right-3 top-2 grid size-8 place-items-center rounded-lg text-xl font-bold text-neutral-400 transition hover:bg-white/[0.08] hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={closeRange}
              className="min-h-10 rounded-lg border border-white/10 px-4 text-xs font-black uppercase text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={applyRange}
              disabled={
                !draftFromDate ||
                !draftToDate ||
                draftToDate < draftFromDate ||
                draftToDate > maxDate
              }
              className="min-h-10 rounded-lg bg-[#e71921] px-4 text-xs font-black uppercase text-white transition hover:bg-[#ff2a33] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aceptar rango
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
