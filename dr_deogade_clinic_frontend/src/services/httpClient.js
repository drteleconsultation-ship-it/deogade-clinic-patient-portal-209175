//
// A lightweight fetch wrapper that uses REACT_APP_API_BASE and provides
// timeout, JSON handling, and error normalization. In mock mode (no API base),
// services can bypass network requests and return mocked data.
//

import { getEnv } from '../config/env';

/**
 * Build a full URL from a relative path and configured API base.
 */
function buildUrl(path) {
  const { apiBase } = getEnv();
  const base = apiBase || '';
  const cleaned = String(path || '').replace(/^\//, '');
  return base ? `${base}/${cleaned}` : `/${cleaned}`;
}

/**
 * Normalize response: attempt JSON, fallback to text.
 */
async function parseResponse(resp) {
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await resp.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await resp.text();
    return { message: text };
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * Core request method with timeout and JSON support.
 */
export async function httpRequest(path, { method = 'GET', headers = {}, body, timeoutMs = 12000, signal } = {}) {
  /** Performs a network request to API base + path with timeout and JSON handling.
   * Parameters:
   *  - path: string (relative API path)
   *  - method: HTTP method
   *  - headers: object of request headers
   *  - body: object|string|FormData; if object and header not set, will send as JSON
   *  - timeoutMs: abort after timeout
   *  - signal: optional AbortSignal
   * Returns: { data, status, ok }
   * Throws: Error with status and data when response not ok.
   */
  const url = buildUrl(path);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
  const signals = [controller.signal];
  if (signal) {
    // Create a composite abort: if external signal aborts, abort our controller too
    const onAbort = () => controller.abort(signal.reason || new Error('Aborted'));
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  const opts = { method, headers: { ...headers }, signal: controller.signal };

  // Automatically JSON-encode plain objects unless FormData/Blob provided
  if (body !== undefined && body !== null) {
    const isFormLike = typeof FormData !== 'undefined' && body instanceof FormData;
    if (!isFormLike && typeof body === 'object' && !(body instanceof Blob)) {
      opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
      opts.body = JSON.stringify(body);
    } else {
      opts.body = body;
    }
  }

  try {
    const resp = await fetch(url, opts);
    const data = await parseResponse(resp);
    if (!resp.ok) {
      const message = (data && (data.error || data.message)) || `HTTP ${resp.status}`;
      const err = new Error(message);
      err.status = resp.status;
      err.data = data;
      throw err;
    }
    return { data, status: resp.status, ok: true };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * PUBLIC_INTERFACE
 * Convenience JSON helpers
 */
export async function httpGet(path, { headers = {}, timeoutMs, signal } = {}) {
  /** GET request that returns parsed data. */
  const res = await httpRequest(path, { method: 'GET', headers, timeoutMs, signal });
  return res.data;
}

export async function httpPost(path, body, { headers = {}, timeoutMs, signal } = {}) {
  /** POST JSON request that returns parsed data. */
  const res = await httpRequest(path, { method: 'POST', headers, body, timeoutMs, signal });
  return res.data;
}

export async function httpUpload(path, formData, { headers = {}, timeoutMs, signal } = {}) {
  /** POST multipart/form-data upload with FormData. */
  const res = await httpRequest(path, { method: 'POST', headers, body: formData, timeoutMs, signal });
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * Utility to check if the app should use mock mode (no API base configured).
 */
export function isMockMode() {
  /** Returns true when there is no API base configured. */
  const { apiBase } = getEnv();
  return !apiBase;
}

export default {
  httpRequest,
  httpGet,
  httpPost,
  httpUpload,
  isMockMode,
};
