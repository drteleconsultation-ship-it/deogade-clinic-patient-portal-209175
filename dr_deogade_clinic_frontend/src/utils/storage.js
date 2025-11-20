const PREFIX = 'deogade_clinic_';

// PUBLIC_INTERFACE
export function save(key, value) {
  /** Save value to localStorage under namespaced key. */
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

// PUBLIC_INTERFACE
export function load(key, fallback = null) {
  /** Load value from localStorage. */
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export function remove(key) {
  /** Remove key from localStorage. */
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}
