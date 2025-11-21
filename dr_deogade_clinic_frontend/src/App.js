import React from 'react';
import AppRouter from './routes/AppRouter';
import './theme/theme.css';
import './App.css';
import { useTheme } from './theme/useTheme';

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
      <AppRouter />
    </div>
  );
}

export default App;
