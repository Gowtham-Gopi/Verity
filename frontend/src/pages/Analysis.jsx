import { useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Save, Zap, X } from 'lucide-react';
import { NVDA_INTRADAY, CATALYST_NODES, WATCHLIST } from '../data/marketData';
import { useVerity } from '../context/VerityContext';

/* ── Custom Catalyst Dot ──────────────────────────── */
function CatalystDot({ cx, cy, payload, activeNode, onNodeClick }) {
  const node = CATALYST_NODES.find(n => n.time === payload.time);
  if (!node) return null;
  const isActive = activeNode === node.id;
  return (
    <g style={{ cursor: 'pointer' }} onClick={() => onNodeClick(node)}>
      {isActive && (
        <circle cx={cx} cy={cy} r={17}
          fill="none" stroke="var(--cyan)" strokeWidth={1.5} opacity={0.5} />
      )}
      <circle cx={cx} cy={cy} r={isActive ? 12 : 9}
        fill={isActive ? 'var(--cyan-dark)' : 'var(--bg-card)'}
        stroke={isActive ? 'var(--cyan-bright)' : 'var(--border-default)'} strokeWidth={isActive ? 2 : 1.5} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={isActive ? '#ffffff' : 'var(--text-secondary)'}
        fontSize={isActive ? 10 : 9} fontWeight={800} fontFamily="var(--font-mono)">
        {node.id}
      </text>
    </g>
  );
}

/* ── Chart Tooltip ────────────────────────────────── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const node = CATALYST_NODES.find(n => n.time === label);
  return (
    <div style={{
      background: 'var(--bg-card-elevated)', border: '1px solid var(--border-strong)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '11.5px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '3px', fontFamily: 'var(--font-mono)' }}>{label} EDT</div>
      <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
        ${payload[0]?.value?.toFixed(2)}
      </div>
      {node && (
        <div style={{
          marginTop: '6px', color: 'var(--amber-bright)', fontSize: '11px',
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'var(--amber-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)',
        }}>
          ⚡ Node {node.id} ({node.tag}): <strong>{node.move}</strong>
        </div>
      )}
    </div>
  );
}

/* ── Why-It-Moved Integrated Inspector Panel ─────────── */
function WhyPanel({ node, onClose, onSimulate }) {
  if (!node) return null;
  const up = node.direction === 'bullish';
  return (
    <div style={{
      width: '320px',
      background: 'var(--bg-card-alt)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
      animation: 'slideRight 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-faint)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--cyan-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)',
            }}>
              {node.id}
            </div>
            <span className={`tag tag-${node.tag.toLowerCase()}`}>{node.tag}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: up ? 'var(--green-bright)' : 'var(--red-bright)',
              background: up ? 'var(--green-bg)' : 'var(--red-bg)',
              padding: '1px 6px', borderRadius: '4px', border: `1px solid ${up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
            }}>
              {node.move}
            </span>
          </div>
          <button
            onClick={onClose}
            title="Close inspector"
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '4px',
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
          {node.narrative.title}
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {node.timeLabel} · {node.headline}
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-faint)' }}>
        <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Catalyst Driver Narrative
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {node.narrative.summary}
        </p>
      </div>

      {/* Factors */}
      <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Factor Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {node.narrative.factors.map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              padding: '8px', borderRadius: '6px',
              background: 'var(--bg-card)', border: '1px solid var(--border-faint)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '4px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: f.impact === '+' ? 'var(--green-bg)' : f.impact === '-' ? 'var(--red-bg)' : 'var(--amber-bg)',
                fontSize: '12px', fontWeight: 800,
                color: f.impact === '+' ? 'var(--green)' : f.impact === '-' ? 'var(--red)' : 'var(--amber)',
              }}>{f.impact}</div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {f.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-faint)', background: 'var(--bg-card)' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', gap: '6px' }}
          onClick={() => onSimulate(node)}
        >
          <Zap size={12} />
          Simulate Shock in What-If →
        </button>
      </div>
    </div>
  );
}

/* ── Metrics Strip ────────────────────────────────── */
function MetricsStrip({ stock }) {
  const up = stock.changePct >= 0;
  const metrics = [
    { label: 'LAST PRICE', value: `$${stock.price.toFixed(2)}`, color: up ? 'var(--green-bright)' : 'var(--red-bright)', large: true },
    { label: '24H DELTA', value: `${up ? '+' : ''}${stock.changePct.toFixed(2)}%`, color: up ? 'var(--green-bright)' : 'var(--red-bright)' },
    { label: 'DAILY VOL', value: stock.volume },
    { label: 'MARKET CAP', value: `$${stock.mktCap}` },
    { label: 'FWD P/E', value: stock.pe.toFixed(1) },
    { label: '30D IV', value: '44.2%', color: 'var(--amber)' },
    { label: 'INST FLOW', value: '+$1.2B', color: 'var(--green-bright)' },
    { label: 'DARK POOL', value: '38%', color: 'var(--purple)' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-card-alt)',
      flexShrink: 0,
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          padding: '7px 12px',
          borderRight: i < metrics.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: i === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
            {m.label}
          </div>
          <div style={{
            fontSize: m.large ? '15px' : '13px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: m.color || 'var(--text-primary)',
            lineHeight: 1.15,
          }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
const TIME_RANGES = ['1D Catalysts', '5D Wire', '1M Impact', 'YTD Macro'];

export default function Analysis() {
  const { activeTicker, navigateTo } = useVerity();
  const [activeNode, setActiveNode] = useState(CATALYST_NODES[0]);
  const [timeRange, setTimeRange] = useState(0);

  const ticker = activeTicker || 'NVDA';
  const stock = WATCHLIST.find(w => w.id === ticker) || WATCHLIST[0];

  const handleNodeClick = useCallback((node) => {
    setActiveNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleSimulate = () => {
    navigateTo('whatif');
  };

  const chartMin = Math.min(...NVDA_INTRADAY.map(d => d.price)) - 3;
  const chartMax = Math.max(...NVDA_INTRADAY.map(d => d.price)) + 3;

  const renderDot = useCallback((props) => (
    <CatalystDot {...props} activeNode={activeNode?.id} onNodeClick={handleNodeClick} />
  ), [activeNode, handleNodeClick]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Ticker Header Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '6px',
            background: 'var(--cyan-dark)', color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)',
          }}>
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {stock.symbol}
              </h1>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stock.name}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NASDAQ · US EQUITIES</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            ${stock.price.toFixed(2)}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: stock.changePct >= 0 ? 'var(--green)' : 'var(--red)',
            background: stock.changePct >= 0 ? 'var(--green-bg)' : 'var(--red-bg)',
            padding: '2px 7px', borderRadius: '4px',
          }}>
            {stock.changePct >= 0 ? '▲ +' : '▼ '}{stock.changePct.toFixed(2)}%
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {}}>
            <Save size={12} /> Save
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigateTo('whatif')}>
            <Zap size={12} /> Simulate in What-If
          </button>
        </div>
      </div>

      {/* ── Key Metrics Strip ── */}
      <MetricsStrip stock={stock} />

      {/* ── Main Workspace: Chart Canvas + Docked Inspector ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Chart Workspace Panel */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
          {/* Controls Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px', borderBottom: '1px solid var(--border-faint)',
            background: 'var(--bg-card-alt)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {TIME_RANGES.map((r, i) => (
                <button
                  key={r}
                  className={`pill-tab ${timeRange === i ? 'active' : ''}`}
                  onClick={() => setTimeRange(i)}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px' }}>
              <div className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                40ms Tick Synchronizer
              </span>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', gap: '6px' }}>
              {['Supplier Feeds (2)', 'Institutional (2)', 'Macro Policy (1)'].map((l) => (
                <button key={l} className="btn btn-ghost btn-xs" style={{ fontSize: '10px' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display Area */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', padding: '8px 12px 4px 6px' }}>
            {/* Catalyst Legend overlay */}
            <div style={{
              position: 'absolute', top: '12px', left: '16px', zIndex: 10,
              display: 'flex', gap: '8px', background: 'rgba(9, 13, 20, 0.85)',
              padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Nodes:
              </span>
              {CATALYST_NODES.map(n => (
                <span
                  key={n.id}
                  onClick={() => handleNodeClick(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                    fontSize: '10.5px', color: activeNode?.id === n.id ? 'var(--cyan)' : 'var(--text-secondary)',
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: activeNode?.id === n.id ? 'var(--cyan)' : 'rgba(255,255,255,0.06)',
                    color: activeNode?.id === n.id ? '#000' : 'var(--text-muted)',
                    fontSize: '9px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                  }}>
                    {n.id}
                  </span>
                  {n.tag}
                </span>
              ))}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NVDA_INTRADAY} margin={{ top: 40, right: 20, left: 10, bottom: 6 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9.5, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} interval={2}
                />
                <YAxis
                  domain={[chartMin, chartMax]}
                  tick={{ fontSize: 9.5, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={52}
                />
                <Tooltip content={<ChartTip />} />
                {CATALYST_NODES.map(n => (
                  <ReferenceLine
                    key={n.id}
                    x={n.time}
                    stroke={activeNode?.id === n.id ? 'var(--cyan)' : 'rgba(6,182,212,0.2)'}
                    strokeDasharray="4 4"
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--cyan)"
                  strokeWidth={2}
                  fill="url(#areaFill)"
                  dot={renderDot}
                  activeDot={{ r: 5, fill: 'var(--cyan)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Integrated Docked Inspector Panel */}
        {activeNode && (
          <WhyPanel
            node={activeNode}
            onClose={() => setActiveNode(null)}
            onSimulate={handleSimulate}
          />
        )}
      </div>

      {/* ── Bottom Catalyst Timeline Ribbon ── */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Catalyst Event Sequence (Intraday Causality Ribbon)</span>
          <span style={{ color: 'var(--cyan)' }}>Click a node to inspect attribution</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          background: 'var(--bg-card-alt)',
          overflow: 'hidden',
        }}>
          {CATALYST_NODES.map((node, i) => {
            const up = node.direction === 'bullish';
            const isActive = activeNode?.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  padding: '9px 12px',
                  borderRight: i < CATALYST_NODES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  borderTop: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                  background: isActive ? 'rgba(59, 130, 246, 0.09)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background var(--t-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '2px',
                    background: isActive ? 'var(--cyan-dark)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                  }}>
                    {node.id}
                  </div>
                  <span className={`tag tag-${node.tag.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {node.tag}
                  </span>
                  <span style={{
                    marginLeft: 'auto', fontSize: '11px', fontWeight: 700,
                    fontFamily: 'var(--font-mono)', color: up ? 'var(--green-bright)' : 'var(--red-bright)',
                  }}>
                    {node.move}
                  </span>
                </div>
                <div style={{
                  fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)',
                  marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {node.headline}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {node.timeLabel} · ${node.price.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
