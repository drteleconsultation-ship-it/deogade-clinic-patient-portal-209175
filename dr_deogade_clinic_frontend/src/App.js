import React from 'react';
import AppRouter from './routes/AppRouter';
import './theme/theme.css';
import './App.css';
import { useTheme } from './theme/useTheme';
import { BookingProvider } from './context/BookingContext';
import WhatsAppFloatButton from './components/common/WhatsAppFloatButton';
import { ToastProvider, ToastHost } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Root App component that provides theme toggle and renders the router.
 */
// PUBLIC_INTERFACE
function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title="Toggle theme"
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <ToastProvider>
        {/* Wrap whole app routes and booking context with ErrorBoundary */}
        <ErrorBoundary>
          <BookingProvider>
            <AppRouter />
          </BookingProvider>
        </ErrorBoundary>
        {/* Toasts live region */}
        <ToastHost />
      </ToastProvider>
      {/* Global WhatsApp FAB */}
      <WhatsAppFloatButton
        phone="919999999999"
        message="Hello Dr. Deogade, I would like to book an appointment."
      />
    </div>
  );
}

export default App;
