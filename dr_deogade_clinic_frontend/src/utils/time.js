function pad(n) {
  return String(n).padStart(2, '0');
}

// PUBLIC_INTERFACE
export function generateTimeSlots({ start = '09:00', end = '18:00', intervalMinutes = 10 } = {}) {
  /** Generate 10-min slots like '09:00', '09:10' between start and end (inclusive end exclusive). */
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const slots = [];
  for (let m = startMin; m < endMin; m += intervalMinutes) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${pad(h)}:${pad(mm)}`);
  }
  return slots;
}
