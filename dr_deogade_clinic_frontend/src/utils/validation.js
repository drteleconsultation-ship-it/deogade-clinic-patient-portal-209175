const PHONE_RE = /^[0-9]{10,13}$/;

// PUBLIC_INTERFACE
export function isValidPhone(phone) {
  /** Validate phone number (10-13 digits). */
  return PHONE_RE.test(String(phone || '').trim());
}

// PUBLIC_INTERFACE
export function required(value) {
  /** Check required fields. */
  return value !== undefined && value !== null && String(value).trim().length > 0;
}
