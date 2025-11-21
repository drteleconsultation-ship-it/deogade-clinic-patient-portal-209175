/**
 * Simple Toast notification system using a portal.
 * Usage:
 *  - import { useToast, ToastHost } from './Toast';
 *  - Place <ToastHost /> once near root (e.g., in App)
 *  - const toast = useToast();
 *  - toast.success('Message') / toast.error('Message')
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

function genId() {
  return Math.random().toString(36).slice(2);
}

/**
 * PUBLIC_INTERFACE
 * Provider to manage toast queue and expose show/success/error helpers.
 */
export function ToastProvider({ children }) {
  /** Provide toast helpers to children */
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', timeout = 3200) => {
    const id = genId();
    setToasts((list) => [...list, { id, message, type, timeout }]);
    return id;
  }, []);

  const success = useCallback((message, timeout) => show(message, 'success', timeout ?? 3200), [show]);
  const error = useCallback((message, timeout) => show(message, 'error', timeout ?? 4200), [show]);
  const info = useCallback((message, timeout) => show(message, 'info', timeout ?? 3000), [show]);

  const value = useMemo(() => ({ show, success, error, info, remove, toasts }), [show, success, error, info, remove, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access toast methods.
 */
export function useToast() {
  /** Returns { show, success, error, info } */
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  const { show, success, error, info } = ctx;
  return { show, success, error, info };
}

/**
 * PUBLIC_INTERFACE
 * Host component rendering toasts in a portal.
 */
export function ToastHost() {
  /** Renders the queue of toasts into a fixed container using a portal */
  const { toasts, remove } = useContext(ToastContext) || { toasts: [], remove: () => {} };
  const containerRef = useRef(null);

  // Ensure a portal container exists in document body
  useEffect(() => {
    let el = document.getElementById('toast-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-root';
      document.body.appendChild(el);
    }
    containerRef.current = el;
  }, []);

  // Auto-remove toasts after timeout
  useEffect(() => {
    const timers = toasts.map((t) => {
      return setTimeout(() => remove(t.id), t.timeout || 3200);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts, remove]);

  if (!containerRef.current) return null;

  const content = (
    <div className="toast-wrap" role="status" aria-live="polite" aria-atomic="true" aria-relevant="additions text">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type}`} role="status" aria-live="polite">
          <span className="toast-icon" aria-hidden="true">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="toast-msg">{t.message}</div>
          <button className="toast-close" aria-label={`Dismiss ${t.type} notification`} onClick={() => remove(t.id)}>
            ✕
          </button>
        </div>
      ))}
      <style>{`
        .toast-wrap {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 100;
          display: grid;
          gap: 8px;
          max-width: min(92vw, 420px);
        }
        .toast-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--color-text);
          box-shadow: var(--shadow-md);
        }
        .toast-item.success { border-color: rgba(37,99,235,.25); }
        .toast-item.error { border-color: rgba(239,68,68,.35); }
        .toast-icon { font-size: 16px; }
        .toast-msg { font-size: 14px; }
        .toast-close {
          border: 1px solid var(--border);
          background: var(--surface-2);
          border-radius: 8px;
          padding: 4px 8px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );

  return createPortal(content, containerRef.current);
}

export default {
  ToastProvider,
  ToastHost,
  useToast,
};
