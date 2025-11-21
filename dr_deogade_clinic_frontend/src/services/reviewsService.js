//
// Reviews service to fetch clinic reviews, with mock fallback.
//

import { httpGet, isMockMode } from './httpClient';
import logger from '../utils/logger';

/**
 * PUBLIC_INTERFACE
 * Fetch recent reviews for the clinic.
 */
export async function fetchReviews({ page = 1, pageSize = 10 } = {}) {
  /** Returns an array of reviews { name, rating, text, date } with pagination metadata when available. */
  const log = logger.createLogger('reviewsService');
  if (isMockMode()) {
    // Provide deterministic mock data
    const items = [
      {
        name: 'Amit Sharma',
        rating: 5,
        text: 'Great experience! The doctor explained everything clearly and the treatment was smooth.',
        date: '2 weeks ago',
      },
      {
        name: 'Priya Verma',
        rating: 5,
        text: 'Very professional and caring staff. Highly recommend for dental cleaning and checkups.',
        date: '1 month ago',
      },
      {
        name: 'Rahul Patil',
        rating: 4,
        text: 'Good clinic with transparent pricing. Had a filling done, painless and quick.',
        date: '3 months ago',
      },
    ];
    return { items, page, pageSize, total: items.length, mode: 'mock' };
  }
  const data = await httpGet(`/reviews?page=${page}&pageSize=${pageSize}`);
  // Normalize shape
  if (Array.isArray(data)) {
    return { items: data, page, pageSize, total: data.length };
  }
  return data;
}

export default {
  fetchReviews,
};
