import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { generateTenMinuteSlots, isClinicOpenOn, isValidSlot } from '../../utils/bookingUtils';
import { useNavigate } from 'react-router-dom';
import UPIPaymentButton from '../../features/payments/UPIPaymentButton';
import { getPaymentSummaryText } from '../../features/payments/paymentUtils';
import FileDropzone from '../common/FileDropzone';
import { sendConfirmation } from '../../services/emailService';
import { useToast } from '../common/Toast';

/**
 * Booking stepper modal with steps:
 * 1. PatientDetailsForm
 * 2. SlotPicker
 * 3. DocumentUpload
 * 4. ReviewAndConfirm
 * Includes keyboard accessibility and responsive design.
 */

function Modal({ isOpen, titleId, onClose, children }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  // Trap focus basic
  useEffect(() => {
    if (!isOpen) return;
    const dlg = dialogRef.current;
    const prev = document.activeElement;
    dlg?.focus();
    return () => prev?.focus();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="booking-modal-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="booking-modal" ref={dialogRef} tabIndex={-1}>
        <button
          className="modal-close"
          aria-label="Close booking"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function StepHeader({ current, steps }) {
  return (
    <ol className="stepper" aria-label="Booking steps">
      {steps.map((s, i) => (
        <li key={s} aria-current={current === i ? 'step' : undefined} className={current === i ? 'active' : current > i ? 'done' : ''}>
          <span className="step-index">{i + 1}</span>
          <span className="step-title">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Field({ label, htmlFor, required, children, helpText }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label} {required ? <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span> : null}
      </label>
      {children}
      {helpText ? <div className="help muted">{helpText}</div> : null}
    </div>
  );
}

function PatientDetailsForm() {
  const { state, actions } = useBooking();
  const [form, setForm] = useState(state.patient);
  const [errors, setErrors] = useState({});

  useEffect(() => setForm(state.patient), [state.patient]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = 'Full name is required';
    if (!/^\+?\d{7,15}$/.test(form.phone.trim())) err.phone = 'Valid phone number is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = 'Invalid email';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onNext = () => {
    if (!validate()) return;
    actions.setPatient(form);
    actions.setStep(1);
  };

  return (
    <section aria-labelledby="step1-title">
      <h2 id="step1-title" className="modal-title">Patient details</h2>
      <div className="grid">
        <Field label="Full name" htmlFor="fullName" required helpText={errors.fullName}>
          <input id="fullName" name="fullName" value={form.fullName} onChange={onChange} aria-invalid={!!errors.fullName} />
        </Field>
        <Field label="Phone" htmlFor="phone" required helpText={errors.phone}>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="+91XXXXXXXXXX" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Email" htmlFor="email" helpText={errors.email}>
          <input id="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Visit type" htmlFor="visitType">
          <select id="visitType" name="visitType" value={form.visitType} onChange={onChange}>
            <option value="in-clinic">In-clinic</option>
            <option value="online">Online</option>
          </select>
        </Field>
        <Field label="Notes" htmlFor="notes" helpText="Optional: Concern or symptoms">
          <textarea id="notes" name="notes" value={form.notes} onChange={onChange} rows={3} />
        </Field>
      </div>
      <div className="modal-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext} aria-label="Next to slot selection">Next</button>
      </div>
    </section>
  );
}

function SlotPicker() {
  const { state, actions } = useBooking();
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [selected, setSelected] = useState(state.slot?.time || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (state.slot?.date) setDate(state.slot.date);
    if (state.slot?.time) setSelected(state.slot.time);
  }, [state.slot]);

  const slots = useMemo(() => {
    if (!isClinicOpenOn(date)) return [];
    return generateTenMinuteSlots(date);
  }, [date]);

  const onBack = () => actions.setStep(0);
  const onNext = () => {
    if (!selected || !isValidSlot(date, selected)) {
      setError('Please select a valid slot');
      return;
    }
    actions.setSlot({ date, time: selected });
    actions.setStep(2);
  };

  return (
    <section aria-labelledby="step2-title">
      <h2 id="step2-title" className="modal-title">Pick a time slot</h2>
      <div className="field">
        <label htmlFor="date">Select date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-describedby="date-help" />
        <div id="date-help" className="help muted">Clinic open Mon–Sat, 10:00–19:00</div>
      </div>

      {!isClinicOpenOn(date) ? (
        <div className="card" role="alert">Clinic is closed on the selected day. Please choose another date.</div>
      ) : slots.length === 0 ? (
        <div className="card" role="status">No slots available for this date.</div>
      ) : (
        <div className="slots-grid" role="list" aria-label="Available slots">
          {slots.map((t) => (
            <button
              key={t}
              role="listitem"
              className={`slot ${selected === t ? 'selected' : ''}`}
              onClick={() => { setSelected(t); setError(''); }}
              aria-pressed={selected === t}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {error ? <div className="help" style={{ color: 'var(--color-error)' }}>{error}</div> : null}

      <div className="modal-actions">
        <button className="btn btn-sm" onClick={onBack} aria-label="Back to patient details">Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext} aria-label="Next to document upload">Next</button>
      </div>
    </section>
  );
}

function DocumentUpload() {
  const { state, actions } = useBooking();

  const onBack = () => actions.setStep(1);
  const onNext = () => actions.setStep(3);

  // Update context with new files list
  const handleFilesChange = (files) => {
    // For graceful degradation (no backend), we just keep files in context
    // In future, if backend exists, we can upload here and store metadata/URLs instead.
    const current = Array.isArray(files) ? files : [];
    const limited = current.slice(0, 5);
    // Reset then add to avoid infinite growth if component reuses existing + new
    // We'll compute delta by replacing with limited
    // Implemented using reset-add approach:
    // Remove all existing then add limited
    // But our actions support only add/remove; simplest: set by clearing then adding
    // Provide an action to replace would be ideal; for now, emulate:
    // Clear by removing from end
    let temp = state.documents;
    if (temp.length !== limited.length || temp.some((f, i) => f !== limited[i])) {
      // Replace by resetting with limited
      // Since context doesn't have replace, we can remove all then add
      // However removing one by one would cause multiple renders.
      // Simpler: provide addDocuments on top of empty by navigating from state - but no RESET for documents only.
      // We'll just dispatch via available actions:
      // 1) Remove all
      for (let i = temp.length - 1; i >= 0; i--) {
        actions.removeDocument(i);
      }
      // 2) Add new
      if (limited.length) actions.addDocuments(limited);
    }
  };

  return (
    <section aria-labelledby="step3-title">
      <h2 id="step3-title" className="modal-title">Upload documents (optional)</h2>
      <p className="muted">You can share previous prescriptions, x-rays, or reports to help the doctor prepare.</p>

      <div className="card">
        <FileDropzone
          label="Add documents"
          description="Drag & drop or click to choose files"
          accept={['image/*', '.pdf', 'application/pdf']}
          maxFiles={5}
          maxSizeBytes={5 * 1024 * 1024}
          compressImages={true}
          compressOptions={{ maxWidth: 1600, maxHeight: 1600, quality: 0.82, mimeType: 'image/jpeg' }}
          value={state.documents}
          onChange={handleFilesChange}
          ariaLabel="Patient document uploader"
        />
      </div>

      <div className="modal-actions">
        <button className="btn btn-sm" onClick={onBack} aria-label="Back to slot picker">Back</button>
        <button className="btn btn-primary btn-lg" onClick={onNext} aria-label="Next to review">Next</button>
      </div>
    </section>
  );
}

function ReviewAndConfirm() {
  const { state, actions } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [ack, setAck] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const onBack = () => actions.setStep(2);

  // Simulate pre-payment reservation or order creation
  const createOrder = async () => {
    // In future connect to backend using REACT_APP_BACKEND_URL
    await new Promise((res) => setTimeout(res, 400));
    return {
      orderId: `ORD-${Date.now()}`,
      amount: '200',
    };
  };

  const onPaymentInitiated = async () => {
    setSubmitting(true);
    setAck('Opening your UPI app… If nothing happens, use the QR below.');
    // Here we could create an order on backend and record intent
    try {
      await createOrder();
    } finally {
      setSubmitting(false);
    }
  };

  const goToSuccess = async (orderId) => {
    // Try sending confirmation email; navigate regardless but inform user via toasts
    try {
      await sendConfirmation({
        patient: state.patient,
        slot: state.slot,
        amount: '200',
        orderId,
      });
      toast.success('Confirmation email sent!');
    } catch (e) {
      toast.error(`Could not send email: ${e?.message || 'Unknown error'}`);
    }
    actions.close();
    navigate('/success', {
      replace: false,
      state: {
        patient: state.patient,
        slot: state.slot,
        amount: '200',
        orderId,
      },
    });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setAck('');
    try {
      const { orderId } = await createOrder();
      // For demo: navigate to success directly after initiating payment.
      // In real integration, navigate after payment confirmation webhook/return.
      await goToSuccess(orderId);
    } catch (e) {
      setAck('Something went wrong. Please try again.');
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentNote = getPaymentSummaryText({
    patient: state.patient,
    slot: state.slot,
    amount: '200',
  });

  return (
    <section aria-labelledby="step4-title">
      <h2 id="step4-title" className="modal-title">Review & confirm</h2>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Patient</h3>
        <p><strong>{state.patient.fullName}</strong></p>
        <p className="muted">{state.patient.phone}{state.patient.email ? ` · ${state.patient.email}` : ''}</p>
        <p className="muted">Visit type: {state.patient.visitType === 'online' ? 'Online' : 'In-clinic'}</p>
        {state.patient.notes ? <p className="muted">Notes: {state.patient.notes}</p> : null}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Slot</h3>
        <p>
          {state.slot?.date} at {state.slot?.time}
        </p>
        <p className="muted">General consultation (10 minutes) · ₹200</p>
      </div>

      {state.documents.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Documents</h3>
          <ul className="file-list">
            {state.documents.map((f, i) => (
              <li key={i} className="file-item">
                <span className="file-name">{f.name || `Document ${i + 1}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ack && <div className="card" role="status" style={{ marginTop: 12 }}>{ack}</div>}

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Pay to confirm</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Tap to pay using your UPI app. If it doesn’t open, a QR will be shown.
        </p>
        <UPIPaymentButton
          vpa="clinic@upi"
          payeeName="Dr Deogade Clinic"
          amount="200"
          note={paymentNote}
          onInitiated={onPaymentInitiated}
          onFallbackShown={() => {}}
        />
        <div style={{ marginTop: 10 }}>
          <button
            className="btn btn-sm"
            onClick={handleConfirm}
            aria-label="I have completed the payment"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            disabled={submitting}
          >
            {submitting ? 'Processing…' : 'I have completed the payment'}
          </button>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-sm" onClick={onBack} disabled={submitting} aria-label="Back to uploads">Back</button>
        <button className="btn btn-primary btn-lg" onClick={handleConfirm} disabled={submitting} aria-label="Confirm booking">
          {submitting ? 'Submitting…' : 'Confirm & Proceed'}
        </button>
      </div>
    </section>
  );
}

// PUBLIC_INTERFACE
export default function BookingStepperModal() {
  /** Entry point component to render the modal and manage step navigation */
  const { state, actions } = useBooking();

  const steps = ['Patient', 'Slot', 'Documents', 'Review'];

  const onClose = () => actions.close();

  return (
    <Modal isOpen={state.isOpen} titleId="booking-title" onClose={onClose}>
      <h1 id="booking-title" className="sr-only">Book an appointment</h1>

      <StepHeader current={state.step} steps={steps} />

      {state.step === 0 && <PatientDetailsForm />}
      {state.step === 1 && <SlotPicker />}
      {state.step === 2 && <DocumentUpload />}
      {state.step === 3 && <ReviewAndConfirm />}
    </Modal>
  );
}

/* Inline styles specific to modal kept here for simplicity */
const style = document.createElement('style');
style.innerHTML = `
.booking-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: grid;
  place-items: end;
  z-index: 80;
}
@media (min-width: 760px) {
  .booking-modal-overlay { place-items: center; }
}
.booking-modal {
  width: 100%;
  max-width: 720px;
  background: var(--surface);
  color: var(--color-text);
  border: 1px solid var(--border);
  border-radius: 16px 16px 0 0;
  box-shadow: var(--shadow-lg);
  padding: 16px;
  position: relative;
}
@media (min-width: 760px) {
  .booking-modal { border-radius: 16px; }
}
.modal-close {
  position: absolute;
  right: 8px;
  top: 8px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
}
.modal-title { margin: 8px 0 12px; }
.field { display: grid; gap: 6px; margin-bottom: 10px; }
.field input, .field select, .field textarea {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 10px;
  padding: 10px;
  color: inherit;
}
.help { font-size: 12px; }
.modal-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.stepper {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0 0 12px 0;
  padding: 0;
}
.stepper li {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 10px;
  padding: 8px;
  font-size: 13px;
  color: var(--color-muted);
}
.stepper li.active {
  border-color: var(--color-primary);
  background: rgba(37,99,235,.08);
  color: var(--color-text);
}
.stepper li.done {
  border-color: var(--color-primary);
  color: var(--color-text);
}
.step-index {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: white;
  border: 1px solid var(--border);
  font-weight: 700;
}
.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
@media (min-width: 760px) {
  .slots-grid { grid-template-columns: repeat(6, 1fr); }
}
.slot {
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
}
.slot.selected {
  border-color: var(--color-primary);
  background: rgba(37,99,235,.08);
}
.upload-area { display: flex; align-items: center; gap: 8px; }
.file-list { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
.file-item {
  display: flex; justify-content: space-between; align-items: center;
  border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px;
}
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
`;
document.head.appendChild(style);
