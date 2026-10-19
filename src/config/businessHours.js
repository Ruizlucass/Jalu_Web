const TUCUMAN_TIME_ZONE = "America/Argentina/Tucuman";

export const RESERVATION_SLOT_MINUTES = 30;


const GENERAL_SCHEDULE = {
  0: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  1: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  2: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  3: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  4: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  5: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
  6: [
    ["11:30", "15:00"],
    ["20:00", "23:30"],
  ],
};

export const BRANCH_SCHEDULES = {
  "Yerba Buena": GENERAL_SCHEDULE,
  Centro: GENERAL_SCHEDULE,
  Otra: GENERAL_SCHEDULE,
};

function tucumanNowParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TUCUMAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value])
  );
}

export function getTodayInTucuman(date = new Date()) {
  const parts = tucumanNowParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getMaxReservationDate(date = new Date()) {
  const [year, month, day] = getTodayInTucuman(date)
    .split("-")
    .map(Number);
  const targetMonthIndex = month - 1 + 3;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = targetMonthIndex % 12;
  const lastDayOfTargetMonth = new Date(
    targetYear,
    normalizedMonth + 1,
    0
  ).getDate();
  const targetDay = Math.min(day, lastDayOfTargetMonth);

  return `${targetYear}-${String(normalizedMonth + 1).padStart(2, "0")}-${String(
    targetDay
  ).padStart(2, "0")}`;
}

function nowMinutesInTucuman(date = new Date()) {
  const parts = tucumanNowParts(date);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes
  ).padStart(2, "0")}`;
}

function dayOfWeek(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 12).getDay();
}

export function getScheduleForDate(branch, dateString) {
  if (!branch || !dateString) return [];

  const branchSchedule = BRANCH_SCHEDULES[branch];
  if (!branchSchedule) return [];

  return branchSchedule[dayOfWeek(dateString)] || [];
}

export function getAvailableReservationTimes(
  branch,
  dateString,
  now = new Date()
) {
  const today = getTodayInTucuman(now);

  if (!branch || !dateString || dateString < today) {
    return [];
  }

  const currentMinutes = nowMinutesInTucuman(now);
  const slots = [];

  getScheduleForDate(branch, dateString).forEach(([start, end]) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    for (
      let minutes = startMinutes;
      minutes <= endMinutes;
      minutes += RESERVATION_SLOT_MINUTES
    ) {
      if (dateString !== today || minutes > currentMinutes) {
        slots.push(minutesToTime(minutes));
      }
    }
  });

  return slots;
}

export function validateReservationDateTime({
  branch,
  date,
  time,
  now = new Date(),
}) {
  if (!branch || !date || !time) {
    return "Seleccioná una sucursal, fecha y horario.";
  }

  const today = getTodayInTucuman(now);

  if (date < today) {
    return "No podés seleccionar una fecha anterior a hoy.";
  }

  if (date > getMaxReservationDate(now)) {
    return "Las reservas se pueden realizar con hasta 3 meses de anticipación.";
  }

  const availableTimes = getAvailableReservationTimes(branch, date, now);

  if (!availableTimes.includes(time)) {
    if (date === today && timeToMinutes(time) <= nowMinutesInTucuman(now)) {
      return "Ese horario ya pasó. Elegí un horario posterior.";
    }

    return "El horario elegido está fuera del horario de atención.";
  }

  return "";
}

export function getScheduleDescription(branch, dateString) {
  const schedule = getScheduleForDate(branch, dateString);

  if (!schedule.length) {
    return "No hay horarios disponibles para la fecha seleccionada.";
  }

  return schedule.map(([start, end]) => `${start} a ${end}`).join(" y ");
}
