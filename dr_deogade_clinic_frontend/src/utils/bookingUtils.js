/**
 * Utilities for generating and validating booking slots.
 * - Slots are 10-minute intervals
 * - Clinic hours: Mon–Sat, 10:00 to 19:00 (7PM)
 */

// PUBLIC_INTERFACE
export function generateTenMinuteSlots(date, options = {}) {
  /** Generate 10-minute slots for a given Date or date string.
   * Returns array of 'HH:mm' 24h time strings, excluding past times for today.
   */
  const {
    startHour = 10,
    endHour = 19, // end boundary hour, last slot ends at 19:00
    intervalMinutes = 10,
  } = options;

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return [];

  const isToday = isSameDate(d, new Date());
  const now = new Date();

  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const slotDate = new Date(d);
      slotDate.setHours(h, m, 0, 0);
      // ensure last slot does not exceed endHour:00
      if (h === endHour && m > 0) break;

      // skip past times if same day
      if (isToday && slotDate <= now) continue;

      slots.push(formatTime(slotDate));
    }
  }
  return slots;
}

// PUBLIC_INTERFACE
export function isClinicOpenOn(date) {
  /** Returns true if clinic is open on given date (Mon–Sat). Sunday closed. */
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  return day !== 0; // Sunday closed
}

// PUBLIC_INTERFACE
export function isValidSlot(date, time, options = {}) {
  /** Validate if a given date (yyyy-mm-dd or Date) and HH:mm time is selectable. */
  const d = normalizeDate(date);
  if (!d) return false;
  if (!isClinicOpenOn(d)) return false;

  const slots = generateTenMinuteSlots(d, options);
  return slots.includes(time);
}

// PUBLIC_INTERFACE
export function combineDateTime(date, time) {
  /** Combine yyyy-mm-dd and HH:mm to a Date object */
  const d = normalizeDate(date);
  if (!d) return null;
  const [hh, mm] = time.split(':').map(Number);
  const dt = new Date(d);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

function normalizeDate(date) {
  if (date instanceof Date) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (typeof date === 'string') {
    const [y, m, d] = date.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
  return null;
}

function formatTime(d) {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
