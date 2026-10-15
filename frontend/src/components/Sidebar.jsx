import {
  LayoutDashboard, LineChart, Cpu, Globe,
  ChevronLeft, ChevronRight, Radio
} from 'lucide-react';
import { useVerity } from '../context/VerityContext';
import { WATCHLIST } from '../data/marketData';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Market & Watchlist',
    shortLabel: 'Markets',
    icon: LayoutDashboard,
    badge: 'LIVE',
    shortcut: '1',
  },
  {
    id: 'analysis',
    label: 'Catalyst Timeline',
    shortLabel: 'Timeline',
    icon: LineChart,
    badge: '5 NODES',
    shortcut: '2',
  },
  {
    id: 'whatif',
    label: 'AI Copilot & What-If',
    shortLabel: 'Copilot',
    icon: Cpu,
    badge: 'MC-90',
    shortcut: '3',
  },
  {
    id: 'macro',
    label: 'Macro & Catalysts',
    shortLabel: 'Macro',
    icon: Globe,
    badge: 'RADAR',
    shortcut: '4',
  },
];

const FEEDS = [
  { label: 'OPRA Options L3', status: 'SYNCED', latency: '0.8ms', color: 'var(--green)' },
  { label: 'SEC Edgar EDGAR', status: 'ACTIVE', latency: '12ms', color: 'var(--cyan)' },
  { label: 'Bloomberg Sentic AI', status: 'READY', latency: '40ms', color: 'var(--amber)' },
];

export default function Sidebar() {
  const {
    activeTab, setActiveTab,
    sidebarCollapsed, toggleSidebar,
    activeTicker, navigateTo
  } = useVerity();

  const currentStock = WATCHLIST.find(w => w.id === activeTicker) || WATCHLIST[0];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Navigation Sidebar">
      {/* ── Sidebar Header ── */}
      <div className="sidebar-header">
        {!sidebarCollapsed ? (
          <>
            <div>
              <div style={{
                fontSize: '9.5px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)' }} />
                Navigation Deck
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                marginTop: '1px',
              }}>
                TERMINAL v2.4.1
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              title="Collapse sidebar"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '5px',
                color: 'var(--text-secondary)',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ChevronLeft size={13} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              color: 'var(--text-secondary)',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--t-fast)',
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Active Ticker Quick Card ── */}
      {!sidebarCollapsed ? (
        <div style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border-faint)',
          background: 'rgba(255, 255, 255, 0.015)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Focus
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: currentStock.changePct >= 0 ? 'var(--green-bright)' : 'var(--red-bright)',
            }}>
              {currentStock.changePct >= 0 ? '+' : ''}{currentStock.changePct.toFixed(2)}%
            </span>
          </div>
          <div
            onClick={() => navigateTo('analysis', currentStock.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '6px 9px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              transition: 'border-color var(--t-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {currentStock.symbol}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '105px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentStock.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                ${currentStock.price.toFixed(2)}
              </div>
              <span style={{ fontSize: '9.5px', color: 'var(--cyan-bright)', fontWeight: 600 }}>Inspect →</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <button
            onClick={() => navigateTo('analysis', currentStock.id)}
            title={`Focus: ${currentStock.symbol} $${currentStock.price.toFixed(2)}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-cyan)',
              borderRadius: '6px',
              padding: '4px 6px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
              {currentStock.symbol}
            </div>
          </button>
        </div>
      )}

      {/* ── Navigation Items ── */}
      <nav className="sidebar-nav">
        {!sidebarCollapsed && (
          <div className="nav-section-label">
            Analytics Engines
          </div>
        )}

        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? `${item.label} (${item.badge})` : undefined}
            >
              <div className="nav-item-icon">
                <Icon size={15} style={{ flexShrink: 0, color: isActive ? 'var(--cyan)' : 'inherit' }} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="nav-item-label">{item.label}</span>
                  <span className="nav-item-badge">{item.badge}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Quant Feeds Section ── */}
      <div style={{
        padding: sidebarCollapsed ? '10px 6px' : '12px 14px',
        borderTop: '1px solid var(--border-faint)',
        background: 'var(--bg-card-alt)',
      }}>
        {!sidebarCollapsed ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <Radio size={10} color="var(--green)" />
                Quant Feeds
              </span>
              <span style={{ fontSize: '9px', color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                3 / 3 OK
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FEEDS.map(feed => (
                <div key={feed.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-faint)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: feed.color,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {feed.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {feed.latency}
                    </span>
                    <span style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: feed.color,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {feed.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} title="Quant Feeds: 3 Active">
            <Radio size={12} color="var(--green)" />
            <div style={{ display: 'flex', gap: '3px' }}>
              {FEEDS.map((f, i) => (
                <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: f.color }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sidebar Footer System Strip ── */}
      <div style={{
        padding: sidebarCollapsed ? '8px 4px' : '8px 14px',
        borderTop: '1px solid var(--border-faint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        fontSize: '9.5px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
      }}>
        {!sidebarCollapsed ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              CONNECTED
            </span>
            <span>EAST-1 · 12ms</span>
          </>
        ) : (
          <span className="live-dot" style={{ width: 6, height: 6 }} title="Connected (12ms)" />
        )}
      </div>
    </aside>
  );
}
