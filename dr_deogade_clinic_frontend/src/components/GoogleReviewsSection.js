import React from 'react';
import { APP_CONFIG } from '../config';

/**
 * Get review sources based on env with safe defaults.
 * Attempts to embed a place URL (if embeddable) otherwise provides link and testimonials fallback.
 */
function getReviewConfig() {
  const {
    REACT_APP_GOOGLE_PLACE_URL
  } = process.env;

  const placeUrl = REACT_APP_GOOGLE_PLACE_URL || 'https://www.google.com/maps';
  // Try to construct an embed from placeUrl if it's a Google maps place link, else leave empty (use fallback)
  // Many modern Google reviews embeds require Place ID and API key; we avoid requiring API keys.
  const canEmbed = typeof placeUrl === 'string' && placeUrl.includes('google.com/maps');
  const embedUrl = canEmbed ? placeUrl.replace('/maps/', '/maps/embed?') : '';

  return { placeUrl, embedUrl };
}

const defaultTestimonials = [
  {
    quote: 'Excellent care and very professional. The booking experience was seamless!',
    author: 'Verified Patient'
  },
  {
    quote: 'Quick booking and friendly staff. Highly recommend the clinic.',
    author: 'Verified Patient'
  },
  {
    quote: 'Doctor explained everything clearly. Short waiting time.',
    author: 'Ravi K.'
  }
];

// PUBLIC_INTERFACE
export default function GoogleReviewsSection({ title = 'Reviews', subtitle = 'What our patients say', testimonials = defaultTestimonials }) {
  /** Shows Google Reviews section. Embeds if possible; otherwise, shows a link and a curated testimonials list. */
  const { placeUrl, embedUrl } = getReviewConfig();

  // Feature flag: reviews visibility
  const show = APP_CONFIG.featureFlags?.reviews !== false;
  if (!show) return null;

  return (
    <section id="reviews" className="section">
      <div className="container">
        <div className="section-header">
          <div className="badge">Feedback</div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {embedUrl ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#E5E7EB' }}>
              <iframe
                title="Google Reviews"
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--color-muted)' }}>
            Read more reviews on Google.
          </div>
          <div>
            <a className="btn" href={placeUrl} target="_blank" rel="noreferrer">Open Google Reviews</a>
          </div>
        </div>

        <div className="grid-2">
          {testimonials.map((t, idx) => (
            <div key={idx} className="card" style={{ padding: 20 }}>
              <p style={{ marginTop: 0 }}>"{t.quote}"</p>
              <div className="hr" />
              <small style={{ color: 'var(--color-muted)' }}>- {t.author}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
