import { useState, useEffect } from 'react';
import { Search, Bell, Wifi, Zap } from 'lucide-react';
import { useVerity } from '../context/VerityContext';

const TICKERS = [
  { s: 'SPY',   p: '512.40', c: '+0.82%', up: true  },
  { s: 'QQQ',   p: '448.15', c: '+1.24%', up: true  },
  { s: 'DIA',   p: '389.98', c: '-0.15%', up: false },
  { s: 'NVDA',  p: '128.45', c: '+4.62%', up: true  },
  { s: 'AAPL',  p: '226.51', c: '+0.38%', up: true  },
  { s: 'MSFT',  p: '432.18', c: '+1.32%', up: true  },
  { s: 'TSLA',  p: '179.10', c: '+3.85%', up: true  },
  { s: 'AMD',   p: '164.28', c: '+2.98%', up: true  },
  { s: 'AMZN',  p: '214.78', c: '+1.63%', up: true  },
  { s: 'META',  p: '582.34', c: '+1.55%', up: true  },
  { s: 'GOOGL', p: '183.45', c: '-1.14%', up: false },
  { s: 'TSM',   p: '195.62', c: '-1.71%', up: false },
  { s: 'VIX',   p: '13.42',  c: '-4.80%', up: true  },
  { s: 'GLD',   p: '241.33', c: '+0.47%', up: true  },
];

function TickerItem({ item }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '0 22px',
      borderRight: '1px solid var(--border-subtle)',
      height: '100%',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
        {item.s}
      </span>
      <span style={{ fontSize: '13.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {item.p}
      </span>
      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.up ? 'var(--green-bright)' : 'var(--red-bright)' }}>
        {item.c}
      </span>
    </span>
  );
}

export default function TopBar() {
  const { searchQuery, setSearchQuery } = useVerity();
  const [_time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const doubled = [...TICKERS, ...TICKERS];

  return (
    <header className="topbar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          borderRadius: '3px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={17} color="#ffffff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
          VERITY
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '3px',
          padding: '3px 9px',
        }}>
          <div className="live-dot" style={{ width: 6, height: 6 }} />
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '0.06em' }}>
            US MARKETS LIVE
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search size={15} style={{
          position: 'absolute', left: '11px', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
        }} />
        <input
          className="input"
          style={{ paddingLeft: '34px', width: '260px', height: '34px', fontSize: '13.5px' }}
          placeholder="Search ticker, catalyst, macro..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Ticker tape */}
      <div className="ticker-tape-wrap">
        <div className="ticker-tape" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          {doubled.map((item, i) => <TickerItem key={i} item={item} />)}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* Net Liq */}
        <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Net Liq</div>
          <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>$284,500</div>
          <div style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--green-bright)', fontWeight: 700 }}>+$3,420 (1.22%)</div>
        </div>

        {/* Latency */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '3px', padding: '5px 10px',
        }}>
          <Wifi size={14} color="var(--green-bright)" />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 700 }}>12ms</span>
        </div>

        {/* Bell */}
        <button style={{
          background: 'transparent', border: '1px solid var(--border-subtle)',
          borderRadius: '3px', width: 32, height: 32, cursor: 'pointer',
          color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={16} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '3px',
          background: 'var(--bg-card-alt)',
          border: '1px solid var(--border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer',
        }}>
          GK
        </div>
      </div>
    </header>
  );
}
