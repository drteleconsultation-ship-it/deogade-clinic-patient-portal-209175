//
// Booking service encapsulating API calls and mock fallbacks for:
// - createBooking
// - listSlots
// - confirmPayment
// - uploadDocument
//

import { httpGet, httpPost, httpUpload, isMockMode } from './httpClient';
import { getEnv } from '../config/env';

/**
 * Utilities for mock data generation
 */
function sleep(ms = 400) {
  return new Promise((res) => setTimeout(res, ms));
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function generateTenMinuteSlots(dateStr) {
  const base = new Date(dateStr);
  if (Number.isNaN(base.getTime())) return [];
  const slots = [];
  const startHour = 10;
  const endHour = 19;
  const interval = 10;
  const now = new Date();
  const isToday =
    now.getFullYear() === base.getFullYear() &&
    now.getMonth() === base.getMonth() &&
    now.getDate() === base.getDate();
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === endHour && m > 0) break;
      const s = new Date(base);
      s.setHours(h, m, 0, 0);
      if (isToday && s <= now) continue;
      const hh = s.getHours().toString().padStart(2, '0');
      const mm = s.getMinutes().toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

/**
 * PUBLIC_INTERFACE
 * Create a booking draft/order before payment.
 */
export async function createBooking(payload) {
  /** Creates a booking in backend or returns a mock booking when API is absent.
   * payload: { patient, slot, notes?, documents? }
   * Returns: { bookingId, amount, currency, status }
   */
  if (isMockMode()) {
    await sleep(350);
    return {
      bookingId: `BKG-${Date.now()}`,
      amount: '200',
      currency: 'INR',
      status: 'pending',
      mode: 'mock',
    };
  }
  const data = await httpPost('/booking', payload);
  return data;
}

/**
 * PUBLIC_INTERFACE
 * List available slots for a given date.
 */
export async function listSlots(date) {
  /** Returns available slot strings for the date in HH:mm format. */
  const d = date || todayISO();
  if (isMockMode()) {
    await sleep(150);
    // Sunday closed (day 0)
    const day = new Date(d).getDay();
    if (day === 0) return [];
    return generateTenMinuteSlots(d);
  }
  const data = await httpGet(`/slots?date=${encodeURIComponent(d)}`);
  return data?.slots || [];
}

/**
 * PUBLIC_INTERFACE
 * Confirm payment for a given booking/order.
 */
export async function confirmPayment({ bookingId, orderId, amount, method = 'UPI' }) {
  /** Confirms a payment and finalizes booking. */
  if (isMockMode()) {
    await sleep(400);
    return {
      ok: true,
      bookingId,
      orderId: orderId || `ORD-${Date.now()}`,
      status: 'confirmed',
      mode: 'mock',
    };
  }
  const data = await httpPost('/payment/confirm', { bookingId, orderId, amount, method });
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Upload a supporting document (image/pdf) for a booking.
 */
export async function uploadDocument(file, { bookingId }) {
  /** Uploads a single file; returns { url, id } or mock metadata. */
  if (!file) throw new Error('No file provided');
  if (isMockMode()) {
    await sleep(250);
    // In mock, we do not persist, just return a fake URL-like identifier
    return {
      id: `doc-${Math.random().toString(36).slice(2)}`,
      name: file.name || 'document',
      size: file.size || 0,
      type: file.type || 'application/octet-stream',
      url: URL.createObjectURL(new Blob(['mock'])),
      mode: 'mock',
    };
  }
  const form = new FormData();
  form.append('file', file);
  if (bookingId) form.append('bookingId', bookingId);
  const data = await httpUpload('/documents', form);
  return data;
}

export default {
  createBooking,
  listSlots,
  confirmPayment,
  uploadDocument,
};
