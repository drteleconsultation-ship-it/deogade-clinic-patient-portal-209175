import { APP_CONFIG } from '../config';
import { apiGet, apiPost } from './apiClient';

// Internal helpers
const MOCK = !APP_CONFIG.apiBase || APP_CONFIG.apiBase === '/api';

/**
 * Generates local mock availability for the next 7 days with 10-minute slots.
 * Returns disabled/blocked randomization to simulate real behavior.
 */
function generateMockAvailability(date, { start = '09:00', end = '18:00', intervalMinutes = 10 } = {}) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const slots = [];
  const rng = Math.abs(hashCode(`${date}`));
  let m = startMin;
  while (m < endMin) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const label = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    // 1 out of ~6 slots unavailable based on deterministic hash
    const blocked = ((rng + m) % 6) === 0;
    slots.push({ time: label, available: !blocked });
    m += intervalMinutes;
  }
  return { date, slots };
}

function hashCode(str) {
  let h = 0, i = 0, len = str.length;
  while (i < len) {
    h = (h << 5) - h + str.charCodeAt(i++) | 0;
  }
  return h;
}

// PUBLIC_INTERFACE
export async function fetchAvailability(date) {
  /** Fetch availability for a given date. Uses backend if configured, otherwise local mock. */
  if (MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockAvailability(date)), 300);
    });
  }
  return apiGet(`/availability?date=${encodeURIComponent(date)}`);
}

// PUBLIC_INTERFACE
export async function createBookingDraft(draft) {
  /** Create a booking draft on the server; in mock mode, echo back with draftId. */
  if (MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ draftId: `draft_${Date.now()}`, ...draft }), 300);
    });
  }
  return apiPost('/bookings/draft', draft);
}

// PUBLIC_INTERFACE
export async function confirmBooking(bookingPayload) {
  /** Confirm booking; in mock mode, randomly succeed or fail based on seed. */
  if (MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const ok = Math.random() > 0.1;
        if (ok) resolve({ status: 'confirmed', bookingId: `bk_${Date.now()}` });
        else reject(new Error('Mock booking failed'));
      }, 500);
    });
  }
  return apiPost('/bookings/confirm', bookingPayload);
}
