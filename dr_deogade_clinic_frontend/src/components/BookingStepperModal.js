import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { fetchAvailability, createBookingDraft, confirmBooking } from '../services/bookingApi';
import { createUpiPaymentIntent, usePaymentPolling } from '../services/paymentApi';
import { generateTimeSlots } from '../utils/time';
import { isValidPhone, required } from '../utils/validation';
import { load, save, remove } from '../utils/storage';
import { useOnlineStatus, OfflineBanner } from '../utils/useOnlineStatus';

// Storage keys
const DRAFT_KEY = 'booking_draft';

// Shared subcomponents
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="booking-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100,
        display: 'grid', placeItems: 'center', padding: 16
      }}>
      <div className="card" style={{ width: '100%', maxWidth: 760, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong id="booking-modal-title">{title || 'Book Appointment'}</strong>
          <button className="btn secondary" onClick={onClose} aria-label="Close booking modal">Close</button>
        </div>
        <div style={{ padding: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, steps }) {
  return (
    <ol aria-label="Booking steps" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 12px 0', flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={s} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 999,
            background: active ? 'rgba(37,99,235,0.15)' : 'rgba(17,24,39,0.04)',
            color: active ? 'var(--color-primary)' : 'var(--color-text)'
          }}>
            <span aria-hidden>{done ? '✓' : i + 1}</span> <span>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function FieldError({ children }) {
  return <div role="alert" style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 6 }}>{children}</div>;
}

const inputStyle = { width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)' };

// Steps
function StepPatientDetails({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});
  function validate() {
    const e = {};
    if (!required(data.fullName)) e.fullName = 'Name is required';
    if (!isValidPhone(data.phone)) e.phone = 'Valid phone required';
    if (!required(data.mode)) e.mode = 'Select consultation type';
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  function handleNext() {
    if (!validate()) return;
    onNext();
  }
  return (
    <section>
      <h3 className="section-title" style={{ fontSize: 20 }}>Patient Details</h3>
      <div className="grid-2">
        <div>
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" aria-invalid={!!errors.fullName} style={inputStyle} value={data.fullName || ''} onChange={(e) => onChange({ fullName: e.target.value })} />
          {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" inputMode="numeric" aria-invalid={!!errors.phone} style={inputStyle} value={data.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} />
          {errors.phone && <FieldError>{errors.phone}</FieldError>}
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="mode">Consultation Type</label>
          <select id="mode" aria-invalid={!!errors.mode} style={inputStyle} value={data.mode || 'online'} onChange={(e) => onChange({ mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="clinic">In Clinic</option>
          </select>
          {errors.mode && <FieldError>{errors.mode}</FieldError>}
        </div>
        <div>
          <label htmlFor="notes">Notes (optional)</label>
          <input id="notes" style={inputStyle} value={data.notes || ''} onChange={(e) => onChange({ notes: e.target.value })} />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={handleNext}>Next</button>
      </div>
    </section>
  );
}

function StepSlotSelection({ data, onChange, onNext, onBack }) {
  const [date, setDate] = useState(data.date || new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState({ slots: [] });
  const [selected, setSelected] = useState(data.slot || '');
  const slots = useMemo(() => generateTimeSlots({ start: '09:00', end: '18:00', intervalMinutes: 10 }), []);

  useEffect(() => {
    let isMounted = true;
    fetchAvailability(date).then((res) => {
      if (!isMounted) return;
      setAvailability(res);
    }).catch(() => setAvailability({ slots: [] }));
    return () => { isMounted = false; };
  }, [date]);

  function handleNext() {
    if (!selected) return;
    onChange({ date, slot: selected });
    onNext();
  }

  const disabledSet = new Set(availability.slots.filter(s => !s.available).map(s => s.time));

  return (
    <section>
      <h3 className="section-title" style={{ fontSize: 20 }}>Select Slot</h3>
      <div className="grid-2">
        <div>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="timezone">Time Zone</label>
          <input id="timezone" disabled value={Intl.DateTimeFormat().resolvedOptions().timeZone} style={{ ...inputStyle, color: 'var(--color-muted)' }} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Available 10-minute Slots</div>
        <div role="listbox" aria-label="Available time slots" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
          {slots.map((s) => {
            const disabled = disabledSet.has(s);
            const selectedBtn = selected === s;
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={selectedBtn}
                disabled={disabled}
                onClick={() => setSelected(s)}
                className="btn"
                style={{
                  padding: '10px 12px',
                  background: selectedBtn ? 'var(--color-secondary)' : 'var(--color-surface)',
                  color: selectedBtn ? '#111827' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn secondary" onClick={onBack}>Back</button>
        <button className="btn" onClick={handleNext} disabled={!selected}>Next</button>
      </div>
    </section>
  );
}

function StepUploadDocuments({ data, onChange, onNext, onBack }) {
  const [previews, setPreviews] = useState(data.docs || []);
  const [error, setError] = useState('');

  function handleFiles(files) {
    const limitMb = 5;
    const valid = [];
    for (const f of files) {
      const isOkType = /image\/(png|jpeg)|application\/pdf/.test(f.type);
      const isOkSize = (f.size / (1024 * 1024)) <= limitMb;
      if (!isOkType) { setError('Only PNG, JPEG or PDF allowed'); continue; }
      if (!isOkSize) { setError(`File ${f.name} exceeds ${limitMb}MB`); continue; }
      valid.push(f);
    }
    if (valid.length === 0) return;
    // Convert to object URLs for preview (not uploaded yet)
    const newItems = valid.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f)
    }));
    const merged = [...previews, ...newItems].slice(0, 6);
    setPreviews(merged);
    onChange({ docs: merged });
    setError('');
  }

  function onInput(e) {
    if (e.target.files && e.target.files.length) handleFiles(Array.from(e.target.files));
  }

  function onDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files);
  }

  function onDragOver(e) { e.preventDefault(); }

  function handleNext() {
    onNext();
  }

  function removeDoc(name) {
    const filtered = previews.filter(p => p.name !== name);
    setPreviews(filtered);
    onChange({ docs: filtered });
  }

  return (
    <section>
      <h3 className="section-title" style={{ fontSize: 20 }}>Upload Documents (optional)</h3>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        aria-label="Upload zone"
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 12,
          padding: 16,
          background: 'rgba(37,99,235,0.03)'
        }}
      >
        <p style={{ marginTop: 0, color: 'var(--color-muted)' }}>Drag & drop images or PDFs here, or click to select (max 6 files, 5MB each)</p>
        <label className="btn" htmlFor="file" style={{ display: 'inline-block', cursor: 'pointer' }}>Select files</label>
        <input id="file" type="file" accept="image/png,image/jpeg,application/pdf" multiple onChange={onInput} style={{ display: 'none' }} />
        {error && <FieldError>{error}</FieldError>}
      </div>
      {!!previews.length && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {previews.map(p => (
            <div key={p.url} className="card" style={{ padding: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 6 }}>{p.name}</div>
              {p.type.startsWith('image/') ? (
                <img src={p.url} alt={p.name} style={{ width: '100%', borderRadius: 8 }} />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>PDF Document</div>
              )}
              <button className="btn secondary" onClick={() => removeDoc(p.name)} style={{ marginTop: 8 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn secondary" onClick={onBack}>Back</button>
        <button className="btn" onClick={handleNext}>Next</button>
      </div>
    </section>
  );
}

function StepPayment({ data, onChange, onNext, onBack, onPaymentCreated }) {
  const [amount, setAmount] = useState(data.amount || (data.mode === 'online' ? 499 : 399));
  const [payerVpa, setPayerVpa] = useState(data.payerVpa || '');
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [status, setStatus] = useState('idle');
  const online = useOnlineStatus();

  async function createIntent() {
    setLoading(true);
    try {
      const res = await createUpiPaymentIntent({ amount, note: 'Consultation', payerVpa });
      setIntent(res);
      onChange({ amount, payerVpa, paymentId: res.id });
      onPaymentCreated && onPaymentCreated(res);
      setStatus('pending');
    } catch (e) {
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  const onPollSuccess = useCallback(() => { setStatus('success'); }, []);
  const onPollFailure = useCallback(() => { setStatus('failed'); }, []);
  usePaymentPolling(intent?.id, { intervalMs: 2000, onSuccess: onPollSuccess, onFailure: onPollFailure });

  useEffect(() => {
    if (status === 'success') {
      onNext();
    }
  }, [status, onNext]);

  return (
    <section>
      <h3 className="section-title" style={{ fontSize: 20 }}>Payment</h3>
      <p className="section-subtitle">Placeholder UPI Intent. Opens supported UPI app or can be copied.</p>
      <div className="grid-2">
        <div>
          <label htmlFor="amount">Amount (INR)</label>
          <input id="amount" type="number" min={0} style={inputStyle} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="vpa">Your UPI ID (optional)</label>
          <input id="vpa" style={inputStyle} value={payerVpa} onChange={(e) => setPayerVpa(e.target.value)} placeholder="name@bank" />
        </div>
      </div>
      {!intent ? (
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={onBack}>Back</button>
          <button className="btn" onClick={createIntent} disabled={loading}>{loading ? 'Creating…' : 'Pay with UPI'}</button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Open UPI App</div>
                <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>Amount ₹{amount}</div>
              </div>
              <a className="btn" href={intent.upiLink} target="_blank" rel="noreferrer">Open UPI App</a>
            </div>
            <div className="hr" />
            <div role="status" aria-live="polite">
              {status === 'pending' && <span>Waiting for payment confirmation…</span>}
              {status === 'failed' && <span style={{ color: 'var(--color-error)' }}>Payment failed. Please try again.</span>}
              {status === 'success' && <span style={{ color: 'var(--color-success)' }}>Payment successful!</span>}
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn secondary" onClick={onBack}>Back</button>
          </div>
        </div>
      )}
    </section>
  );
}

function StepReviewConfirm({ data, onBack }) {
  const [loading, setLoading] = useState(false);
  const online = useOnlineStatus();
  async function submit() {
    if (!online) return;
    setLoading(true);
    try {
      // Create/confirm booking
      const payload = { ...data };
      await confirmBooking(payload);
      remove(DRAFT_KEY);
      window.location.assign('/success');
    } catch (e) {
      window.location.assign('/failure');
    } finally {
      setLoading(false);
    }
  }
  return (
    <section>
      <h3 className="section-title" style={{ fontSize: 20 }}>Review & Confirm</h3>
      <div className="card" style={{ padding: 12 }}>
        <Item label="Name" value={data.fullName} />
        <Item label="Phone" value={data.phone} />
        <Item label="Type" value={data.mode} />
        <Item label="Date" value={data.date} />
        <Item label="Slot" value={data.slot} />
        <Item label="Amount" value={`₹${data.amount}`} />
        {!!(data.docs?.length) && (
          <>
            <div className="hr" />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Documents</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.docs.map((d) => (
                <span key={d.url} className="badge">{d.name}</span>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn secondary" onClick={onBack}>Back</button>
        <button className="btn" onClick={submit} disabled={loading || !online} aria-disabled={loading || !online}>{loading ? 'Confirming…' : 'Confirm Booking'}</button>
      </div>
    </section>
  );
}

function Item({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, padding: '6px 0' }}>
      <div style={{ color: 'var(--color-muted)' }}>{label}</div>
      <div>{value || '-'}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function BookingStepperModal({ open, onClose, initial }) {
  /** A11y-friendly modal stepper guiding through booking flow with 10-minute slots and mockable APIs. */
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => load(DRAFT_KEY, {
    fullName: '',
    phone: '',
    mode: initial?.mode || 'online',
    date: initial?.date || new Date().toISOString().split('T')[0],
    slot: initial?.slot || '',
    docs: [],
    amount: initial?.mode === 'clinic' ? 399 : 499,
  }));

  function patch(p) {
    const merged = { ...data, ...p };
    setData(merged);
    save(DRAFT_KEY, merged);
  }
  function next() { setStep((s) => Math.min(s + 1, 4)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  useEffect(() => {
    // Initialize draft on open
    if (open) {
      createBookingDraft({ ...data }).then((draft) => {
        patch({ draftId: draft.draftId });
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const steps = ['Patient', 'Slot', 'Documents', 'Payment', 'Review'];

  useEffect(() => {
    if (!open) {
      // reset step when closing
      setStep(0);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); setTimeout(() => { remove(DRAFT_KEY); setStep(0); }, 0); }}
      title="Book Appointment"
    >
      <Stepper step={step} steps={steps} />
      {step === 0 && <StepPatientDetails data={data} onChange={patch} onNext={next} />}
      {step === 1 && <StepSlotSelection data={data} onChange={patch} onNext={next} onBack={back} />}
      {step === 2 && <StepUploadDocuments data={data} onChange={patch} onNext={next} onBack={back} />}
      {step === 3 && <StepPayment data={data} onChange={patch} onNext={next} onBack={back} onPaymentCreated={(i) => patch({ paymentId: i.id })} />}
      {step === 4 && <StepReviewConfirm data={data} onBack={back} />}
      <div className="hr" />
      <div aria-live="polite" style={{ color: 'var(--color-muted)', fontSize: 12 }}>
        Your progress is auto-saved. You can close this window and resume later.
      </div>
    </Modal>
  );
}
