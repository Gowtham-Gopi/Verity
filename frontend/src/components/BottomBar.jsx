import { useState, useEffect } from 'react';

export default function BottomBar() {
  const [time, setTime] = useState(() => new Date());
  const [ws] = useState('0.04ms');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (d) => d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  return (
    <footer className="bottombar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'var(--green)', fontWeight: 700 }}>
          ⬡ WebSocket: {ws}
        </span>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <span>
          FINRA / SEC Form BD rule 15a-6 compliant. Model predictions are probabilistic simulations. Not investment advice.
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--text-muted)' }}>NYSE/NASDAQ:</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          {fmtTime(time)} EDT
        </span>
      </div>
    </footer>
  );
}
