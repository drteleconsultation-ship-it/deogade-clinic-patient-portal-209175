//
// Email service for sending booking confirmation emails via backend
//

/**
 * Resolve API base URL from environment variable.
 * Falls back to empty string, which triggers mock mode.
 */
function getApiBase() {
  const base = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
  return typeof base === 'string' ? base.trim().replace(/\/+$/, '') : '';
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
 * If REACT_APP_API_BASE is configured, it will call:
 *   POST {REACT_APP_API_BASE}/email/booking-confirmation
 * with payload containing patient, slot, and payment details.
 * If not configured, this function will simulate a success response after a short delay.
 */
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

  // Mock mode if API base is not configured
  if (!base) {
    // Simulate send and log to console for visibility
    // eslint-disable-next-line no-console
    console.info('[emailService] Mock send booking confirmation', payload);
    await new Promise((res) => setTimeout(res, 500));
    return { success: true, message: 'Mock email sent (no API configured)', id: `mock-${Date.now()}` };
  }

  const url = `${base}/email/booking-confirmation`;
  const data = await postJson(url, payload);
  // Normalize response
  return {
    success: true,
    ...(typeof data === 'object' ? data : { message: 'Email sent' }),
  };
}

export default {
  sendConfirmation,
};
