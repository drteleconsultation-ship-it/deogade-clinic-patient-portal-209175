import React, { useMemo, useState } from 'react';
import { generateTimeSlots } from '../utils/time';
import BookingStepperModal from './BookingStepperModal';
import { useOnlineStatus, OfflineBanner } from '../utils/useOnlineStatus';

// PUBLIC_INTERFACE
export default function BookingCard({ onBook }) {
  /** Booking card to pick date/time (10-min slots) and appointment type. Opens stepper modal. */
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState('');
  const [mode, setMode] = useState('online');
  const [open, setOpen] = useState(false);
  const online = useOnlineStatus();

  // Working hours 9am-6pm 10-min interval
  const slots = useMemo(() => generateTimeSlots({ start: '09:00', end: '18:00', intervalMinutes: 10 }), [date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slot) return;
    if (!online) return; // block when offline
    onBook?.({ date, slot, mode });
    setOpen(true);
  };

  return (
    <div id="book" className="card" style={{ padding: 20 }}>
      <div className="section-header">
        <div className="badge">Book Appointment</div>
        <h2 className="section-title">Choose your slot</h2>
        <p className="section-subtitle">Online or In-clinic consultation. 10-minute slots.</p>
      </div>
      {!online && <OfflineBanner message="You are offline. Booking is disabled until internet is restored." />}
      <form onSubmit={handleSubmit} aria-label="booking form">
        <div className="grid-2">
          <div>
            <label htmlFor="date" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Date</label>
            <input
              id="date"
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}
            />
          </div>
          <div>
            <label htmlFor="mode" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Consultation Type</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}
            >
              <option value="online">Online</option>
              <option value="clinic">In Clinic</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Available Slots</div>
          <div role="listbox" aria-label="Available slots" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => online && setSlot(s)}
                className="btn"
                aria-pressed={slot === s}
                aria-label={`Slot ${s}${slot === s ? ' selected' : ''}`}
                disabled={!online}
                style={{
                  padding: '10px 12px',
                  background: slot === s ? 'var(--color-secondary)' : 'var(--color-surface)',
                  color: slot === s ? '#111827' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  opacity: online ? 1 : 0.6,
                  cursor: online ? 'pointer' : 'not-allowed'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button className="btn" type="submit" disabled={!slot || !online} aria-disabled={!slot || !online}>Continue</button>
          <a className="btn secondary" href="https://maps.google.com" target="_blank" rel="noreferrer">Get Directions</a>
        </div>
      </form>
      <BookingStepperModal
        open={open}
        onClose={() => setOpen(false)}
        initial={{ date, slot, mode }}
      />
    </div>
  );
}
