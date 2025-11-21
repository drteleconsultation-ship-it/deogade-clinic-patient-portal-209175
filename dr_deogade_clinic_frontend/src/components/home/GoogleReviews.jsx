import React from 'react';

/**
 * Google Reviews component.
 * If widgetUrl is provided, shows the widget in an iframe; otherwise shows a mocked list of recent reviews.
 */

// PUBLIC_INTERFACE
export default function GoogleReviews({
  widgetUrl = '',
  title = 'What our patients say',
}) {
  /** Displays reviews via widget or mock data. */
  const mock = [
    {
      name: 'Amit Sharma',
      rating: 5,
      text:
        'Great experience! The doctor explained everything clearly and the treatment was smooth.',
      date: '2 weeks ago',
    },
    {
      name: 'Priya Verma',
      rating: 5,
      text:
        'Very professional and caring staff. Highly recommend for dental cleaning and checkups.',
      date: '1 month ago',
    },
    {
      name: 'Rahul Patil',
      rating: 4,
      text:
        'Good clinic with transparent pricing. Had a filling done, painless and quick.',
      date: '3 months ago',
    },
  ];

  return (
    <section aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="section-title">{title}</h2>
      {widgetUrl ? (
        <div className="reviews-widget">
          <iframe
            title="Google Reviews"
            src={widgetUrl}
            loading="lazy"
            style={{ border: 0 }}
            aria-label="Google Reviews widget"
          />
        </div>
      ) : (
        <ul className="reviews-grid" role="list">
          {mock.map((r, i) => (
            <li className="card review" role="listitem" key={i}>
              <div className="review-head">
                <strong className="reviewer">{r.name}</strong>
                <span className="date muted">{r.date}</span>
              </div>
              <div className="stars" aria-label={`${r.rating} out of 5 stars`}>
                {'★★★★★☆☆☆☆☆'.slice(5 - r.rating, 10 - r.rating)}
              </div>
              <p className="muted" style={{ margin: 0 }}>{r.text}</p>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .reviews-widget {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }
        .reviews-widget iframe {
          display: block;
          width: 100%;
          height: 360px;
        }
        .reviews-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 760px) {
          .reviews-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .review {
          display: grid;
          gap: 6px;
        }
        .review-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
        }
        .reviewer { font-size: 14px; }
        .stars {
          color: #f59e0b;
          letter-spacing: 2px;
          font-size: 14px;
        }
      `}</style>
    </section>
  );
}
