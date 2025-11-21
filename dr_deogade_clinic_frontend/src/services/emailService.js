//
// Email service for sending booking confirmation emails via backend
//
import { getEnv, hasApiBase } from '../config/env';
import logger from '../utils/logger';

/**
 * Resolve API base URL from environment variable.
 * Falls back to empty string, which triggers mock mode.
 */
function getApiBase() {
  const { apiBase } = getEnv();
  return typeof apiBase === 'string' ? apiBase.trim().replace(/\/*$/, '') : '';
}

/**
 * Build request headers for JSON requests.
 */
function getJsonHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Send a POST to backend, handling JSON and errors.
 */
async function postJson(url, payload) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const contentType = resp.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await resp.json().catch(() => null);
  } else {
    const text = await resp.text().catch(() => '');
    data = { message: text };
  }
  if (!resp.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Send booking confirmation email.
 * If API base is configured and mock flag is not forcing mock, it will call:
 *   POST {API_BASE}/email/booking-confirmation
 * Otherwise simulates a success response after a short delay.
 */
// PUBLIC_INTERFACE
export async function sendConfirmation({ patient, slot, amount, orderId }) {
  /** Sends a booking confirmation email via backend or mocked delay if API base is absent.
   * Parameters:
   *  - patient: { fullName, email, phone, visitType, notes }
   *  - slot: { date, time }
   *  - amount: string, e.g., "200"
   *  - orderId: string reference ID
   * Returns: { success: boolean, message?: string, id?: string }
   */
  const base = getApiBase();
  const log = logger.createLogger('emailService');
  const payload = {
    patient,
    slot,
    amount,
    orderId,
    meta: {
      source: 'frontend',
      url: (typeof window !== 'undefined' && window.location.href) || '',
      sentAt: new Date().toISOString(),
    },
  };

  // Mock mode if API base is not configured or flags force mock
  if (!hasApiBase()) {
    log.info('sendConfirmation (mock)', { hasApiBase: false });
    await new Promise((res) => setTimeout(res, 500));
    return { success: true, message: 'Mock email sent (no API configured)', id: `mock-${Date.now()}` };
  }

  const url = `${base}/email/booking-confirmation`;
  log.info('sendConfirmation (api)', { url });
  const data = await postJson(url, payload);
  log.debug('sendConfirmation response', data);
  // Normalize response
  return {
    success: true,
    ...(typeof data === 'object' ? data : { message: 'Email sent' }),
  };
}

export default {
  sendConfirmation,
};
