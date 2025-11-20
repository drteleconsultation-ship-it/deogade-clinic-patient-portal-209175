import { APP_CONFIG } from '../config';
import { apiPost } from './apiClient';
import { useEffect, useRef } from 'react';

 // In mock mode, payment intent and status are simulated locally without server calls
const MOCK = !APP_CONFIG.apiBase || APP_CONFIG.apiBase === '/api';

// PUBLIC_INTERFACE
export async function createUpiPaymentIntent({ amount, note, payerVpa }) {
  /** Create a UPI payment intent; in mock mode, provide a simulated deep link and id. */
  if (MOCK) {
    const id = `pay_${Date.now()}`;
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        id,
        amount,
        upiLink: `upi://pay?pa=demo@upi&pn=Dr%20Deogade%20Clinic&tn=${encodeURIComponent(note || 'Consultation')}&am=${amount}&cu=INR`,
        status: 'pending'
      }), 300);
    });
  }
  return apiPost('/payments/upi-intent', { amount, note, payerVpa });
}

// PUBLIC_INTERFACE
export async function pollPaymentStatus(paymentId) {
  /** Poll payment status; in mock mode, mark success after ~2-5 polls. */
  if (MOCK) {
    const seed = Number(String(paymentId).replace(/\D/g, '').slice(-3)) || 3;
    const counterKey = `_mock_poll_${paymentId}`;
    const count = Number(sessionStorage.getItem(counterKey) || '0') + 1;
    sessionStorage.setItem(counterKey, String(count));
    if (count >= (seed % 4) + 2) {
      return { id: paymentId, status: 'success' };
    }
    return { id: paymentId, status: 'pending' };
  }
  return apiPost('/payments/status', { paymentId });
}

// PUBLIC_INTERFACE
export function usePaymentPolling(paymentId, { intervalMs = 2000, onSuccess, onFailure } = {}) {
  /** React hook poller which starts automatically when paymentId is provided and cleans up on unmount or id change. */
  const timerRef = useRef(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    if (!paymentId) return undefined;

    async function tick() {
      try {
        const res = await pollPaymentStatus(paymentId);
        if (stoppedRef.current) return;
        if (res.status === 'success') {
          stoppedRef.current = true;
          clearInterval(timerRef.current);
          timerRef.current = null;
          onSuccess && onSuccess(res);
        } else if (res.status === 'failed') {
          stoppedRef.current = true;
          clearInterval(timerRef.current);
          timerRef.current = null;
          onFailure && onFailure(res);
        }
      } catch (e) {
        stoppedRef.current = true;
        clearInterval(timerRef.current);
        timerRef.current = null;
        onFailure && onFailure({ error: String(e) });
      }
    }

    // Kick off
    tick();
    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      stoppedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paymentId, intervalMs, onSuccess, onFailure]);
}
