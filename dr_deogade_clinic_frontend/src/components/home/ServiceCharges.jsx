import React from 'react';

// PUBLIC_INTERFACE
export default function ServiceCharges() {
  /** Displays a concise list of service charges in cards */
  const items = [
    { name: 'General Consultation (10 min)', price: '₹200' },
    { name: 'Teeth Cleaning', price: '₹800' },
    { name: 'Filling (per tooth)', price: '₹1,200' },
    { name: 'Root Canal (starting)', price: '₹3,500' },
  ];

  return (
    <div role="region" aria-labelledby="charges-title">
      <h2 id="charges-title" className="section-title">Service Charges</h2>
      <div className="grid grid-2" role="list">
        {items.map((it, idx) => (
          <div className="card" role="listitem" key={idx}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>{it.name}</h3>
                <p className="muted" style={{ margin: 0 }}>Transparent pricing</p>
              </div>
              <strong style={{ color: 'var(--color-primary)' }}>{it.price}</strong>
            </div>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
        Note: Prices may vary based on diagnosis and treatment complexity.
      </p>
    </div>
  );
}
