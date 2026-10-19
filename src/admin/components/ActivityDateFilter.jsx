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

export function activityRangeBounds(period, date) {
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);

  if (period === "week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 7);
  } else if (period === "month") {
    start.setDate(1);
    end.setFullYear(start.getFullYear(), start.getMonth() + 1, 1);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: localDateString(start),
    endDate: localDateString(end),
  };
}

export function useActivityDate() {
  const [date, setDate] = useState(todayLocalDate);
  const [period, setPeriod] = useState("day");

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
        setPeriod("day");
        updateAtMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };

    updateAtMidnight();
    return () => window.clearTimeout(timer);
  }, []);

  return [date, setDate, period, setPeriod];
}

export function ActivityDateFilter({ date, onChange, period, onPeriodChange }) {
  const periods = [
    { id: "day", label: "Día" },
    { id: "week", label: "Semana" },
    { id: "month", label: "Mes" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-end sm:justify-between">
      <label className="grid min-w-0 gap-2 text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
        Fecha de referencia
        <input
          type="date"
          value={date}
          onChange={(event) => onChange(event.target.value || todayLocalDate())}
          className="min-h-11 w-full min-w-0 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 text-sm font-bold normal-case tracking-normal text-white [color-scheme:dark] focus:border-[#e71921] focus:outline-none sm:w-auto"
        />
      </label>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-[#b9b9b9]">
          Ver actividad por
        </span>
        <div className="grid grid-cols-3 gap-2">
          {periods.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={period === id}
              onClick={() => onPeriodChange(id)}
              className={`min-h-11 rounded-xl border px-4 text-xs font-black uppercase transition duration-200 hover:-translate-y-0.5 ${
                period === id
                  ? "border-[#e71921]/50 bg-gradient-to-r from-[#e71921] to-[#b90e16] text-white shadow-[0_8px_20px_rgba(231,25,33,0.18)]"
                  : "border-white/[0.08] bg-[#0f0f0f] text-[#aaa] hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
