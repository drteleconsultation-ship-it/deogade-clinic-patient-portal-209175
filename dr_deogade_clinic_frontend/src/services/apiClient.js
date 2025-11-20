import { APP_CONFIG } from '../config';

// Basic fetch wrapper avoiding secrets hardcoding
const API_BASE = APP_CONFIG.apiBase;

// PUBLIC_INTERFACE
export async function apiGet(path, opts = {}) {
  /** Simple GET request to backend API.
   * path: string - endpoint path (e.g., '/health')
   * returns: JSON parsed response
   */
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

// PUBLIC_INTERFACE
export async function apiPost(path, body = {}, opts = {}) {
  /** Simple POST request to backend API. */
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

// PUBLIC_INTERFACE
export function navigateToPayment(payload) {
  /** Placeholder for payment navigation; will be implemented in later steps. */
  // For now, just navigate to success to validate routing
  window.location.assign('/success');
}

// PUBLIC_INTERFACE
export function getWhatsAppLink(message = 'Hello%20Doctor%2C%20I%20want%20to%20book%20an%20appointment.') {
  /** Returns WhatsApp link using configured phone if available. */
  const phone = APP_CONFIG.whatsappPhone; // Expect numeric string without +
  if (!phone) return 'https://wa.me/';
  return `https://wa.me/${phone}?text=${message}`;
}
