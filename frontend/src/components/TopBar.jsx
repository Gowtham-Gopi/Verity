import { useState, useEffect } from 'react';
import { Search, Bell, Wifi, Zap } from 'lucide-react';
import { useVerity } from '../context/VerityContext';
import { useAuth } from '../context/AuthContext';

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
  const { searchQuery, setSearchQuery, navigateTo } = useVerity();
  const { user, token, isAuthenticated, logout, openAuthModal } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [_time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const doubled = [...TICKERS, ...TICKERS];

  return (
    <header className="topbar">
      {/* Logo */}
      <div 
        onClick={() => navigateTo('landing')}
        title="Return to Verity Landing Page"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, cursor: 'pointer' }}
      >
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
      <div className="ticker-tape-wrap" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div className="ticker-tape">
          {doubled.map((item, i) => <TickerItem key={i} item={item} />)}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0, marginLeft: 'auto' }}>
        <button
          onClick={() => navigateTo('landing')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '3px', padding: '5px 11px',
            color: 'var(--cyan-bright)', fontSize: '11px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}
          title="Return to Landing Page & System Overview"
        >
          <Zap size={13} />
          <span>PORTAL</span>
        </button>

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

        {/* User Auth Section */}
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px', padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#ffffff'
              }}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                {user?.name || 'Account'}
              </span>
            </div>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 220, background: '#161922',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                padding: '12px', zIndex: 1000,
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', wordBreak: 'break-all' }}>{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                    navigateTo('landing');
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    fontSize: '12.5px', fontWeight: 600,
                    padding: '8px 12px', borderRadius: '4px', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => openAuthModal('login', 'Please sign in to access the dashboard.')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f1f5f9',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => openAuthModal('signup', 'Create an account to access the dashboard.')}
              style={{
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
