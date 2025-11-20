// PUBLIC_INTERFACE
export function useOnlineStatus() {
  /** React hook returning boolean of navigator.onLine and updates on network changes. */
  const [online, setOnline] = require('react').useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  require('react').useEffect(() => {
    function on() { setOnline(true); }
    function off() { setOnline(false); }
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}

// PUBLIC_INTERFACE
export function OfflineBanner({ message = 'You are offline. Some actions are disabled until connectivity is restored.' }) {
  /** Inline banner to display when offline. */
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.35)',
        color: '#991B1B',
        padding: 10,
        borderRadius: 10,
        marginBottom: 12
      }}
    >
      {message}
    </div>
  );
}
