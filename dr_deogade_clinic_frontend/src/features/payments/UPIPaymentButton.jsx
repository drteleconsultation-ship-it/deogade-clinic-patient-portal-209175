import React, { useMemo, useState } from 'react';
import { buildUpiDeepLink, tryOpenDeepLink, getPaymentSummaryText } from './paymentUtils';
import { getEnv } from '../../config/env';

/**
 * Lightweight inlined QR using a third-party chart API (no dependency).
 * Note: For production, replace with a local QR generator if required.
 */
function QRCode({ text, size = 180, alt = 'QR code' }) {
  const src = useMemo(() => {
    const base = 'https://api.qrserver.com/v1/create-qr-code/';
    const qs = `?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    return `${base}${qs}`;
  }, [text, size]);
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      style={{ borderRadius: 12, border: '1px solid var(--border)' }}
    />
  );
}

// PUBLIC_INTERFACE
export default function UPIPaymentButton({
  vpa = 'clinic@upi',
  payeeName = 'Dr Deogade Clinic',
  amount = '200',
  note = 'Consultation',
  orderId,
  callbackUrl,
  buttonLabel = 'Pay via UPI',
  showQR = true,
  onInitiated,
  onFallbackShown,
}) {
  /** Button that triggers UPI intent via deep link and shows QR fallback if needed. */
  const [showQrFallback, setShowQrFallback] = useState(false);
  const { flags = {} } = getEnv();
  const qrEnabled = flags.upiQRFallback !== false && showQR !== false;

  const deeplink = useMemo(() => {
    return buildUpiDeepLink({
      pa: vpa,
      pn: payeeName,
      am: amount,
      tn: note,
      tr: orderId,
      url: callbackUrl,
      cu: 'INR',
    });
  }, [vpa, payeeName, amount, note, orderId, callbackUrl]);

  const handlePay = () => {
    onInitiated && onInitiated();
    const attempted = tryOpenDeepLink(deeplink);
    // On desktop or when UPI apps are unavailable, the intent may not open;
    // offer a QR as fallback. We cannot detect failure reliably; expose a manual toggle.
    if (!attempted && qrEnabled) {
      setShowQrFallback(true);
      onFallbackShown && onFallbackShown();
    } else if (qrEnabled) {
      // Provide a hint for users where nothing happens
      setTimeout(() => {
        setShowQrFallback(true);
        onFallbackShown && onFallbackShown();
      }, 1200);
    }
  };

  return (
    <div>
      <button className="btn btn-primary btn-lg" onClick={handlePay} aria-label="Pay using UPI apps">
        {buttonLabel}
      </button>

      {qrEnabled && showQrFallback && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Scan to Pay</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            If your UPI app did not open automatically, scan this QR with any UPI app.
          </p>
          <div style={{ display: 'grid', placeItems: 'center', padding: 8 }}>
            <QRCode text={deeplink} size={220} alt="UPI payment QR" />
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            UPI ID: <strong>{vpa}</strong> · Amount: <strong>₹{amount}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export { buildUpiDeepLink, getPaymentSummaryText };
