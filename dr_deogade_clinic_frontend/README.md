# Dr. Deogade Clinic Frontend

This is the React frontend for the Dr. Deogade Clinic patient portal. It provides appointment booking with 10-minute slots, WhatsApp integration, Google Maps and reviews display, a stepper-driven booking flow with document upload, a placeholder UPI payment intent and polling experience, and Progressive Web App (PWA) support. The app runs fully in mock mode if a backend is not configured, and seamlessly switches to REST APIs when a backend is provided.

## Quick Start

- Node.js 18+ and npm are recommended.
- Install dependencies:
  - npm install
- Run in development:
  - npm start
  - The app opens at http://localhost:3000
- Run tests:
  - npm test
- Build for production:
  - npm run build

## Project Structure

Key files and folders:

- src/App.js – Routes and layout (Home, Success, Failure)
- src/pages/Home.js – Single-page layout composing booking, maps, reviews, WhatsApp
- src/components/* – UI components including BookingCard, BookingStepperModal, GoogleMapSection, GoogleReviewsSection, WhatsAppFloatingButton, Header, Footer, StickyCTA
- src/services/apiClient.js – Fetch wrapper and WhatsApp link helper
- src/services/bookingApi.js – Booking availability/draft/confirm with mock mode fallback
- src/services/paymentApi.js – UPI intent creation and status polling with mock mode fallback
- src/utils/* – Utilities (online status, time slot generation, storage, validation)
- src/config.js – Central configuration and feature flags
- src/index.js – App bootstrap and conditional PWA service worker registration
- src/theme.css – “Ocean Professional” theme variables and base styles

## Running With Environment Variables

This app uses CRA’s REACT_APP_* pattern. Define variables in a .env file at the project root or inject them at runtime. Below is the full list for this container.

- REACT_APP_API_BASE: Base path or URL for backend APIs. When unset or set to /api, the app assumes mock mode for booking and payments.
- REACT_APP_BACKEND_URL: Alternative source for API base if REACT_APP_API_BASE is not provided.
- REACT_APP_FRONTEND_URL: Public URL of the frontend, used in some link generation scenarios.
- REACT_APP_WS_URL: WebSocket endpoint if used in future enhancements.
- REACT_APP_NODE_ENV: Environment label (development, production).
- REACT_APP_NEXT_TELEMETRY_DISABLED: Reserved placeholder; no effect in this codebase but supported for parity with environments that pass it.
- REACT_APP_ENABLE_SOURCE_MAPS: When true, enables source maps in production builds if supported by tooling.
- REACT_APP_PORT: Port hint for hosting environments; CRA dev server uses 3000 unless overridden by PORT. This value is read into APP_CONFIG.port but not enforced by CRA.
- REACT_APP_TRUST_PROXY: When true, signals reverse proxy trust; available for future SSR/proxy-aware behavior (not used directly).
- REACT_APP_LOG_LEVEL: Log level hint (info by default).
- REACT_APP_HEALTHCHECK_PATH: Health check path for backend availability checks (/health by default).
- REACT_APP_FEATURE_FLAGS: JSON string controlling UI features. Example: {"maps": true, "reviews": true}
- REACT_APP_EXPERIMENTS_ENABLED: When true, enables experiments flag in APP_CONFIG.
- REACT_APP_PWA_ENABLED: When true, registers the service worker at runtime to enable installable PWA behavior.
- REACT_APP_CLINIC_ADDRESS: Human-readable address used by map and directions links.
- REACT_APP_GOOGLE_MAPS_EMBED_URL: Full Google Maps embed URL. If omitted, an address-based query embed is used that does not require an API key.
- REACT_APP_GOOGLE_PLACE_URL: Google Maps “place” or “reviews” URL for outbound navigation and optional embedding.
- REACT_APP_WHATSAPP_PHONE: A numeric string without + used by the WhatsApp chat link (e.g., 919876543210).

Example .env for local development:

REACT_APP_API_BASE=/api
REACT_APP_FEATURE_FLAGS={"maps":true,"reviews":true}
REACT_APP_PWA_ENABLED=true
REACT_APP_CLINIC_ADDRESS=Dr. Deogade Clinic, Nagpur, India
REACT_APP_GOOGLE_PLACE_URL=https://www.google.com/maps/place/Your+Clinic+Place+Url
REACT_APP_WHATSAPP_PHONE=919876543210

## Feature Flags

Feature flags are parsed from REACT_APP_FEATURE_FLAGS as JSON in src/config.js and consumed across components:

- maps: Controls visibility of the GoogleMapSection. If false, the section is not rendered.
- reviews: Controls visibility of the GoogleReviewsSection. If false, the section is not rendered.

Example:

REACT_APP_FEATURE_FLAGS={"maps":true,"reviews":false}

## WhatsApp Configuration

WhatsApp is surfaced via:

- Floating action button: src/components/WhatsAppFloatingButton.js
- Sticky CTA and Footer links
- Helper: src/services/apiClient.js#getWhatsAppLink

To configure the WhatsApp recipient:

- Set REACT_APP_WHATSAPP_PHONE to a numeric string including country code, without the leading + (for example, 919876543210).
- Optionally customize the default message by passing a message to getWhatsAppLink(message) when building custom buttons.

If REACT_APP_WHATSAPP_PHONE is not set, generic https://wa.me/ is used.

## Google Maps and Reviews

The app uses iframe embeds that do not require an API key by default.

- Map: src/components/GoogleMapSection.js
  - Uses REACT_APP_CLINIC_ADDRESS to build a query-based embed link if REACT_APP_GOOGLE_MAPS_EMBED_URL is not provided.
  - Also renders “Open in Google Maps” and “Get Directions” buttons using the configured address or place URL.
- Reviews: src/components/GoogleReviewsSection.js
  - Uses REACT_APP_GOOGLE_PLACE_URL for outbound navigation.
  - If the place URL looks like a Google Maps link, we attempt a simple embed path transformation; otherwise, the component falls back to a curated testimonials list and a button linking to the Google page.

To set a precise place link, configure:

REACT_APP_CLINIC_ADDRESS="Dr. Deogade Clinic, Nagpur, India"
REACT_APP_GOOGLE_PLACE_URL="https://www.google.com/maps/place/..."

## Progressive Web App (PWA)

PWA support is optional and disabled by default. When enabled:

- A service worker is registered at runtime if the browser supports it (see src/index.js).
- Users can install the app to their device from the browser’s install prompt.
- Offline shell caching can be implemented via a service worker file. If you need full offline support, add a service worker at public/service-worker.js or wire CRA’s service worker solution and keep REACT_APP_PWA_ENABLED=true.

To enable:

REACT_APP_PWA_ENABLED=true

Required PWA assets are listed in the “Required Assets” section below.

Note: When offline, the app disables booking actions and displays a clear banner stating that the user is offline (see useOnlineStatus and OfflineBanner).

## Mock Mode Behavior

Mock mode is automatic when a backend is not configured:

- Booking and payment services detect mock mode if APP_CONFIG.apiBase is not set or equals /api.
- In mock mode:
  - Availability is generated locally with deterministic blocked slots based on date (src/services/bookingApi.js).
  - Booking draft creation returns a mock draftId.
  - Booking confirmation randomly succeeds to simulate real-world outcomes.
  - UPI payment intent returns a simulated deep link and id; the status poller marks success after a few polls (src/services/paymentApi.js).

To force backend mode, set REACT_APP_API_BASE to a non-default, fully qualified URL or a distinct path that your reverse proxy routes to a live backend, for example:

REACT_APP_API_BASE=https://api.example.com

## Integrating With Proposed Backend APIs

When REACT_APP_API_BASE points to a live backend, the frontend will call the following endpoints. The endpoint shapes are inferred from the service calls and mock responses:

- GET /availability?date=YYYY-MM-DD
  - Response shape:
    - { "date": "YYYY-MM-DD", "slots": [ { "time": "HH:mm", "available": true|false }, ... ] }
- POST /bookings/draft
  - Request body:
    - { "fullName": string, "phone": string, "mode": "online"|"clinic", "date": "YYYY-MM-DD", "slot": "HH:mm", "docs": Array<{ name, type, size? }>, "amount": number }
  - Response shape:
    - { "draftId": string, ...original fields }
- POST /bookings/confirm
  - Request body:
    - Booking payload including draftId and paymentId if applicable. The component sends the merged booking data collected across steps.
  - Response shape:
    - { "status": "confirmed", "bookingId": string }
- POST /payments/upi-intent
  - Request body:
    - { "amount": number, "note": string, "payerVpa"?: string }
  - Response shape:
    - { "id": string, "amount": number, "upiLink": string, "status": "pending" }
- POST /payments/status
  - Request body:
    - { "paymentId": string }
  - Response shape:
    - { "id": string, "status": "pending"|"success"|"failed" }

CORS and cookies:
- The fetch wrapper uses credentials: 'include'. Configure CORS accordingly on the backend if you set cookies or require session-based flows.
- REACT_APP_FRONTEND_URL can be used on the backend to whitelist the origin.

Health check:
- REACT_APP_HEALTHCHECK_PATH defaults to /health in APP_CONFIG and may be used for future automated checks.

## Building, Deploying, and Running

Development:
- npm start starts the CRA dev server at http://localhost:3000. Set environment variables in a .env file or inline before the command.

Production build:
- npm run build outputs static assets into build/.
- Host the build/ directory behind any static file server or CDN. Ensure your environment variables are baked into the build step or injected via environment-specific builds.

Reverse proxy:
- When deploying behind a reverse proxy, route API requests (REACT_APP_API_BASE) to the backend service and serve the static frontend. If the backend is on the same host, a path prefix such as /api is typical.

## Required Assets

Provide the following assets to ensure the UI and PWA appear polished. Place them under public/ unless your hosting setup specifies otherwise.

- Favicon and icons:
  - public/favicon.ico – 32x32 or 48x48
  - public/icons/icon-192.png – 192x192 PNG
  - public/icons/icon-512.png – 512x512 PNG
  - public/apple-touch-icon.png – 180x180 PNG
  - public/icons/maskable-192.png – 192x192 PNG with safe margins for maskable icons
  - public/icons/maskable-512.png – 512x512 PNG with safe margins for maskable icons
- Web app manifest (if using PWA):
  - public/manifest.json – Should reference the above icons and set theme_color to #2563EB and background_color to #f9fafb.
- Brand assets:
  - public/logo.png – Recommended sizes: 512x512 and 1024x1024 for responsive layouts
  - public/og-image.png – 1200x630 for social sharing previews
- Optional splash screens (for iOS PWA):
  - public/splash-640x1136.png
  - public/splash-750x1334.png
  - public/splash-1125x2436.png
  - public/splash-1242x2208.png
  - public/splash-1536x2048.png
  - public/splash-1668x2224.png
  - public/splash-2048x2732.png

Note: If you do not provide PWA assets, PWA features may still work but the install experience will be generic and not branded.

## Accessibility and Offline UX

- The booking flow honors offline status. Actions that require the network are disabled and an inline banner communicates the offline state.
- The stepper modal and buttons include aria roles and labels to provide accessible navigation.
- The UI follows a high-contrast, modern theme aimed at readability and clarity.

## Troubleshooting

- App starts but APIs fail:
  - Verify REACT_APP_API_BASE and backend CORS configuration. In development, mock mode is activated by default when API base is missing or set to /api.
- PWA not installing:
  - Ensure REACT_APP_PWA_ENABLED=true at build/runtime. Provide a valid manifest.json and icons. Test over HTTPS and a production-like host.
- WhatsApp link not working:
  - Verify REACT_APP_WHATSAPP_PHONE is numeric and includes country code without +.

## License

This repository provides the frontend assets and code for the clinic website. See your organization’s licensing policy for distribution and reuse.
