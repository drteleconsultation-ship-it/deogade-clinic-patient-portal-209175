//
// Payment utilities for UPI deeplink and QR fallback
//

/**
 * Encode key=value pairs into UPI query string
 */
function toQuery(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

// PUBLIC_INTERFACE
export function buildUpiDeepLink({ pa, pn, am, tn, cu = 'INR', tr, url }) {
  /** Build a UPI deep link (upi://pay) string for intent-based payments.
   * pa: UPI ID (VPA) e.g., clinic@upi
   * pn: Payee name, e.g., Dr Deogade Clinic
   * am: Amount in string format, e.g., "200"
   * tn: Transaction note, short text
   * cu: Currency, default INR
   * tr: Transaction reference/order id (recommended)
   * url: Optional callback or reference URL
   */
  const qs = toQuery({ pa, pn, am, tn, cu, tr, url });
  return `upi://pay?${qs}`;
}

// PUBLIC_INTERFACE
export function tryOpenDeepLink(href) {
  /** Attempts to open a deep link by setting window.location.
   * Returns true if operation attempted; cannot guarantee success.
   */
  try {
    window.location.href = href;
    return true;
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export function getPaymentSummaryText({ patient, slot, amount }) {
  /** Returns a user-facing payment description string. */
  const name = patient?.fullName || 'Patient';
  const when = slot ? `${slot.date} ${slot.time}` : 'Selected slot';
  return `${name} - Consultation on ${when} - Amount ₹${amount}`;
}
