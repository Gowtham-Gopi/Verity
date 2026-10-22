import { useState, useMemo, useEffect } from 'react';
import {
  Zap, ArrowRight, Activity, Terminal, Shield, Cpu,
  Database, GitBranch, Play, ExternalLink, BarChart3,
  Layers, Search, CheckCircle2, ChevronRight, Sliders,
  RefreshCw, TrendingUp, AlertCircle, Radio, LineChart as LucideLineChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useVerity } from '../context/VerityContext';
import { useAuth } from '../context/AuthContext';
import { WATCHLIST, MARKET_INDICES, CATALYST_FEED } from '../data/marketData';
import './LandingPage.css';

/* ── Live Market Ticker Strip ── */
function TickerTape({ onSelectTicker }) {
  const items = [...MARKET_INDICES, ...WATCHLIST.map(w => ({
    symbol: w.symbol,
    price: w.price,
    changePct: w.changePct,
    label: w.name
  }))];

  return (
    <div style={{
      width: '100%',
      background: 'rgba(10, 12, 16, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      height: 34,
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 16px',
        background: '#11141a',
        borderRight: '1px solid var(--border-default)',
        height: '100%',
        flexShrink: 0,
        zIndex: 2
      }}>
        <span className="telemetry-dot" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '0.04em' }}>
          LIVE FEED
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 20px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        whiteSpace: 'nowrap'
      }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            onClick={() => onSelectTicker(it.symbol)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span style={{ fontWeight: 750, color: '#fff' }}>{it.symbol}</span>
            <span style={{ color: 'var(--text-secondary)' }}>${Number(it.price).toFixed(2)}</span>
            <span style={{
              fontWeight: 700,
              color: it.changePct >= 0 ? 'var(--green-bright)' : 'var(--red-bright)'
            }}>
              {it.changePct >= 0 ? `+${it.changePct}%` : `${it.changePct}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Interactive Sandbox Component ── */
function SandboxCockpit({ onOpenTerminal }) {
  const [activeMode, setActiveMode] = useState('catalyst'); // catalyst | orderbook | montecarlo | graph
  const [selectedTicker, setSelectedTicker] = useState('NVDA');
  const [shockFactor, setShockFactor] = useState(0); // -20 to +20
  const [selectedCatalystId, setSelectedCatalystId] = useState(1);
  const [orderBookTicks, setOrderBookTicks] = useState([
    { time: '14:26:01.842', venue: 'DARK_POOL', size: 14200, price: 875.40, side: 'BUY' },
    { time: '14:26:02.109', venue: 'IEX', size: 4500, price: 875.35, side: 'SELL' },
    { time: '14:26:02.314', venue: 'EDGX', size: 8800, price: 875.50, side: 'BUY' },
    { time: '14:26:02.780', venue: 'ARCA', size: 12000, price: 875.45, side: 'BUY' }
  ]);

  // Live order book tape stream simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const venues = ['DARK_POOL', 'IEX', 'NASDAQ', 'EDGX', 'ARCA'];
      const sides = ['BUY', 'SELL'];
      const currentStock = WATCHLIST.find(w => w.symbol === selectedTicker) || WATCHLIST[0];
      const basePrice = currentStock.price;
      const jitter = (Math.random() - 0.48) * 0.4;
      const newTick = {
        time: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100),
        venue: venues[Math.floor(Math.random() * venues.length)],
        size: Math.floor(Math.random() * 150 + 10) * 100,
        price: Number((basePrice + jitter).toFixed(2)),
        side: sides[Math.floor(Math.random() * sides.length)]
      };

      setOrderBookTicks(prev => [newTick, ...prev.slice(0, 5)]);
    }, 1800);

    return () => clearInterval(timer);
  }, [selectedTicker]);

  const currentStock = useMemo(() => {
    return WATCHLIST.find(w => w.symbol === selectedTicker) || WATCHLIST[0];
  }, [selectedTicker]);

  // Monte Carlo distribution calculation based on shockFactor
  const simulationData = useMemo(() => {
    const data = [];
    const baseMean = currentStock.price * (1 + shockFactor / 100);
    const stdDev = currentStock.price * 0.045;

    for (let i = -18; i <= 18; i++) {
      const x = baseMean + (i * stdDev) / 5;
      const exponent = -0.5 * Math.pow((x - baseMean) / stdDev, 2);
      const density = Math.round((1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 100000);
      data.push({
        price: Math.round(x),
        density,
        baseline: density * 0.8
      });
    }
    return data;
  }, [currentStock, shockFactor]);

  const currentCatalyst = useMemo(() => {
    return CATALYST_FEED.find(c => c.id === selectedCatalystId) || CATALYST_FEED[0];
  }, [selectedCatalystId]);

  return (
    <div className="sandbox-frame">
      {/* Sandbox Top Control Bar */}
      <div className="sandbox-topbar">
        <div className="sandbox-controls">
          <button
            className={`sandbox-tab-btn ${activeMode === 'catalyst' ? 'active' : ''}`}
            onClick={() => setActiveMode('catalyst')}
          >
            <LucideLineChart size={14} />
            <span>Causal Catalyst Engine</span>
          </button>
          <button
            className={`sandbox-tab-btn ${activeMode === 'orderbook' ? 'active' : ''}`}
            onClick={() => setActiveMode('orderbook')}
          >
            <Activity size={14} />
            <span>L3 Order Book & Dark Pool</span>
          </button>
          <button
            className={`sandbox-tab-btn ${activeMode === 'montecarlo' ? 'active' : ''}`}
            onClick={() => setActiveMode('montecarlo')}
          >
            <Cpu size={14} />
            <span>Monte Carlo Shock Engine</span>
          </button>
          <button
            className={`sandbox-tab-btn ${activeMode === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveMode('graph')}
          >
            <GitBranch size={14} />
            <span>Causal Network Graph</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sandbox-ticker-selector">
            {['NVDA', 'TSM', 'MSFT', 'AMZN', 'GOOGL'].map(t => (
              <button
                key={t}
                className={`sandbox-ticker-pill ${selectedTicker === t ? 'active' : ''}`}
                onClick={() => setSelectedTicker(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenTerminal(selectedTicker)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: 'var(--cyan-bright)',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 2,
              cursor: 'pointer'
            }}
          >
            <span>Launch In Terminal</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Sandbox Content Body */}
      <div className="sandbox-body">
        {/* MODE 1: Causal Catalyst Engine */}
        {activeMode === 'catalyst' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{currentStock.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>({currentStock.symbol})</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      color: currentStock.changePct >= 0 ? 'var(--green-bright)' : 'var(--red-bright)'
                    }}>
                      ${currentStock.price.toFixed(2)} ({currentStock.changePct >= 0 ? '+' : ''}{currentStock.changePct}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    FEED: EDGAR 8-K VECTORIZED // CONFIDENCE INDEX: 94.2%
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green-bright)',
                  padding: '3px 8px', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <CheckCircle2 size={12} />
                  <span>PREDICTIVE ALPHA POSITIVE</span>
                </div>
              </div>

              {/* Sparkline & Event Timeline */}
              <div style={{
                height: 190,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 2,
                padding: '12px 12px 0 0'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentStock.sparkData.map((val, idx) => ({ time: `T-${10 - idx}m`, price: val }))}>
                    <defs>
                      <linearGradient id="catalystGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickLine={false} orientation="right" />
                    <Tooltip
                      contentStyle={{ background: '#11141a', border: '1px solid #3b82f6', borderRadius: 2, fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#catalystGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Catalyst Selection Strip */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>
                  DETECTED CAUSAL SIGNALS (CLICK TO CORRELATE):
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CATALYST_FEED.slice(0, 3).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatalystId(cat.id)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        textAlign: 'left',
                        background: selectedCatalystId === cat.id ? 'var(--bg-card-elevated)' : 'rgba(255,255,255,0.02)',
                        border: selectedCatalystId === cat.id ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                        borderRadius: 2,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)', fontWeight: 700 }}>
                          {cat.tag}
                        </span>
                        <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', color: 'var(--green-bright)' }}>
                          {cat.priceMove}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 11, color: '#e2e8f0', marginTop: 4, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {cat.headline}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Detailed Catalyst Vector Analysis */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: 18,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 12
              }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 800 }}>
                  [NODE-{currentCatalyst.id}] CAUSAL VECTOR BREAKDOWN
                </span>
                <span style={{
                  fontSize: 10.5, fontFamily: 'var(--font-mono)',
                  padding: '2px 6px', background: 'rgba(59,130,246,0.1)', color: 'var(--cyan-bright)', borderRadius: 2
                }}>
                  {currentCatalyst.confidence}% CONFIDENCE
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 10 }}>
                {currentCatalyst.headline}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                {currentCatalyst.summary}
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: 12,
                borderRadius: 2,
                border: '1px solid var(--border-subtle)',
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Historical Causal Match:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>98.4% (Q3-2024 Pattern)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Supply Elasticity Delta:</span>
                  <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>+14.2 bps</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Latency to Tape Impact:</span>
                  <span style={{ color: 'var(--cyan-bright)', fontWeight: 700 }}>420 milliseconds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: L3 Order Book & Dark Pool */}
        {activeMode === 'orderbook' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  OPRA LEVEL 3 ORDER DEPTH // {selectedTicker}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)' }}>
                  LATENCY: 0.8ms (NY4 CROSS-CONNECT)
                </span>
              </div>

              {/* Order Book Ladder */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 12
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)', fontSize: 10.5
                }}>
                  <span>BID SIZE (SHARES)</span>
                  <span style={{ textAlign: 'center' }}>PRICE (USD)</span>
                  <span style={{ textAlign: 'right' }}>ASK SIZE (SHARES)</span>
                </div>

                {/* Asks */}
                {[
                  { price: (currentStock.price + 0.35).toFixed(2), ask: '18,400', depth: '78%' },
                  { price: (currentStock.price + 0.20).toFixed(2), ask: '12,900', depth: '55%' },
                  { price: (currentStock.price + 0.05).toFixed(2), ask: '6,200', depth: '26%' }
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '6px 12px', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0,
                      width: row.depth, background: 'rgba(244, 63, 94, 0.08)', zIndex: 0
                    }} />
                    <span style={{ zIndex: 1 }}>-</span>
                    <span style={{ textAlign: 'center', color: 'var(--red-bright)', fontWeight: 700, zIndex: 1 }}>{row.price}</span>
                    <span style={{ textAlign: 'right', color: '#fff', zIndex: 1 }}>{row.ask}</span>
                  </div>
                ))}

                {/* Mid price spread */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderTop: '1px solid rgba(59, 130, 246, 0.3)',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '6px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11
                }}>
                  <span style={{ color: 'var(--cyan-bright)', fontWeight: 700 }}>SPREAD: $0.05 (0.57 bps)</span>
                  <span style={{ color: '#fff', fontWeight: 800 }}>MID: ${currentStock.price.toFixed(2)}</span>
                  <span style={{ color: 'var(--green-bright)' }}>IMBALANCE: +18.4% BID</span>
                </div>

                {/* Bids */}
                {[
                  { price: (currentStock.price - 0.05).toFixed(2), bid: '24,100', depth: '85%' },
                  { price: (currentStock.price - 0.15).toFixed(2), bid: '15,800', depth: '62%' },
                  { price: (currentStock.price - 0.30).toFixed(2), bid: '9,400', depth: '35%' }
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '6px 12px', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: row.depth, background: 'rgba(16, 185, 129, 0.08)', zIndex: 0
                    }} />
                    <span style={{ color: '#fff', zIndex: 1 }}>{row.bid}</span>
                    <span style={{ textAlign: 'center', color: 'var(--green-bright)', fontWeight: 700, zIndex: 1 }}>{row.price}</span>
                    <span style={{ textAlign: 'right', zIndex: 1 }}>-</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Pool Tape Stream */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: 16,
              borderRadius: 2
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 10
              }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 800 }}>
                  REAL-TIME DARK VENUE RECONSTRUCTION
                </span>
                <span className="telemetry-dot" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orderBookTicks.map((tick, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)', borderRadius: 2,
                    fontFamily: 'var(--font-mono)', fontSize: 11
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{tick.time}</span>
                      <span style={{
                        padding: '1px 5px',
                        background: tick.venue === 'DARK_POOL' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        color: tick.venue === 'DARK_POOL' ? '#c084fc' : 'var(--cyan-bright)',
                        fontSize: 9.5, fontWeight: 700, borderRadius: 2
                      }}>
                        {tick.venue}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 700, marginRight: 8 }}>{tick.size.toLocaleString()} shs</span>
                      <span style={{
                        color: tick.side === 'BUY' ? 'var(--green-bright)' : 'var(--red-bright)',
                        fontWeight: 800
                      }}>
                        ${tick.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Monte Carlo Shock Engine */}
        {activeMode === 'montecarlo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  10,000 ITERATION PATH DENSITY (STUDENT-T FAT TAILS)
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)' }}>
                  SIMD WASM CORE ACTIVE
                </span>
              </div>

              {/* Distribution Recharts */}
              <div style={{
                height: 200,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 2,
                padding: '12px 12px 0 0'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationData}>
                    <defs>
                      <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="price" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} orientation="right" />
                    <Tooltip
                      contentStyle={{ background: '#11141a', border: '1px solid #10b981', borderRadius: 2, fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} fill="url(#mcGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Shock Controller Slider */}
              <div style={{
                marginTop: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 16px',
                borderRadius: 2
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    SCENARIO SHOCK STIMULUS:
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
                    color: shockFactor > 0 ? 'var(--green-bright)' : shockFactor < 0 ? 'var(--red-bright)' : 'var(--text-primary)'
                  }}>
                    {shockFactor > 0 ? `+${shockFactor}%` : `${shockFactor}%`} (Macro & Supply Shift)
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={shockFactor}
                  onChange={(e) => setShockFactor(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>-20% Severe Contraction</span>
                  <span>0% Status Quo</span>
                  <span>+20% Supply Expansion</span>
                </div>
              </div>
            </div>

            {/* Right: Risk Engine Metrics */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              padding: 18,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{
                borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8,
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 800
              }}>
                PARAMETRIC RISK METRICS (POST-SHOCK)
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10
              }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 2 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>VaR (99.0% 1-DAY)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--red-bright)', fontFamily: 'var(--font-mono)' }}>
                    -${(currentStock.price * 0.048 * (1 - shockFactor / 100)).toFixed(2)}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 2 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EXPECTED SHORTFALL</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--amber-bright)', fontFamily: 'var(--font-mono)' }}>
                    -${(currentStock.price * 0.062).toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: 12,
                borderRadius: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tail Risk Probability:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>2.14% (&gt; 3σ)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Implied Vol Skew Shift:</span>
                  <span style={{ color: 'var(--cyan-bright)', fontWeight: 700 }}>+1.85 pts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sim Execution Time:</span>
                  <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>1.4 ms (WASM)</span>
                </div>
              </div>

              <button
                onClick={() => onOpenTerminal(selectedTicker)}
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'var(--cyan-bg)',
                  border: '1px solid var(--border-cyan)',
                  color: 'var(--cyan-bright)',
                  padding: '9px 14px',
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Run Full 100k Multi-Asset Simulation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* MODE 4: Causal Network Graph */}
        {activeMode === 'graph' && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 2,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)' }}>
                GLOBAL SEMICONDUCTOR & CLOUD CAUSAL NETWORK GRAPH
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                40,000+ TIERS TRACKED // REAL-TIME RECURSIVE PROPAGATION
              </span>
            </div>

            {/* Interactive Graph Node Schematic */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              alignItems: 'center'
            }}>
              {[
                { title: 'ASML (Lithography)', role: 'Tier-1 Equipment', status: 'High-NA EUV Shipped', color: 'var(--green)' },
                { title: 'TSMC (Foundry)', role: 'Tier-1 Packaging', status: 'CoWoS Capacity +30k', color: 'var(--cyan)' },
                { title: 'NVIDIA (GPU Architecture)', role: 'Primary Core', status: 'Blackwell Ultra Ramp', color: 'var(--cyan-bright)' },
                { title: 'MICROSOFT (Azure AI)', role: 'Hyperscaler Capex', status: '$19B Data Center Plan', color: 'var(--purple)' }
              ].map((node, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  padding: 16,
                  borderRadius: 2,
                  position: 'relative'
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 4 }}>
                    {node.role}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                    {node.title}
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', color: node.color,
                    padding: '2px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 2,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {node.status}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid var(--border-cyan)',
              padding: 12,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 11
            }}>
              <span style={{ color: '#fff' }}>
                Causal Transmission Coefficient: <strong>0.84 (TSMC CoWoS ➔ NVDA Margin Expansion ➔ MSFT Azure Cluster Deliveries)</strong>
              </span>
              <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>
                PROPAGATION TIME: 14 DAYS AHEAD OF MARKET CONSENSUS
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Landing Page Component ── */
export default function LandingPage() {
  const { navigateTo } = useVerity();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const handleLaunchTerminal = (ticker = 'NVDA') => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in to access the Verity dashboard.');
      return;
    }
    navigateTo('search', ticker);
  };

  return (
    <div className="landing-viewport">
      <div className="landing-grid-bg" />

      {/* ── Top Navigation Bar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-left">
          <div className="brand-badge" onClick={() => handleLaunchTerminal('NVDA')}>
            <div className="brand-icon-box">
              <Zap size={18} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span className="brand-name">VERITY</span>
            <span className="brand-tag">QUANT-OS v4.9</span>
          </div>
        </div>

        <div className="landing-nav-center">
          <a href="#sandbox" className="nav-link">
            <span className="num">01</span>
            <span>Live Sandbox</span>
          </a>
          <a href="#features" className="nav-link">
            <span className="num">02</span>
            <span>Quant Engine</span>
          </a>
          <a href="#specs" className="nav-link">
            <span className="num">03</span>
            <span>Architecture</span>
          </a>
          <a href="#cli" className="nav-link">
            <span className="num">04</span>
            <span>CLI Protocol</span>
          </a>
        </div>

        <div className="landing-nav-right">
          <div className="telemetry-chip">
            <span className="telemetry-dot" />
            <span>OPRA L3: 840μs</span>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '4px 10px', borderRadius: 6,
                fontSize: 12
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#2563eb', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ color: '#fff', fontWeight: 600 }}>{user?.name}</span>
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  padding: '5px 10px', borderRadius: 4,
                  fontSize: 12, cursor: 'pointer', fontWeight: 500
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => openAuthModal('login', 'Please sign in to access the Verity dashboard.')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f1f5f9',
                  padding: '6px 14px', borderRadius: 4,
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('signup', 'Create an account to access the Verity dashboard.')}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 14px', borderRadius: 4,
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          <button className="btn-launch-terminal" onClick={() => handleLaunchTerminal('NVDA')}>
            <span>Launch Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Live Market Ticker Strip ── */}
      <TickerTape onSelectTicker={(t) => handleLaunchTerminal(t)} />

      {/* ── Hero Section ── */}
      <header className="landing-hero">
        <div className="hero-meta-strip">
          <span className="hero-meta-tag">INSTITUTIONAL RELEASE</span>
          <span>SUB-MILLISECOND CAUSAL MARKET INTELLIGENCE TERMINAL</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--green-bright)' }}>EQUINIX NY4 ACTIVE</span>
        </div>

        <h1 className="hero-headline">
          Deterministic market intelligence <br />
          <span className="accent">for quantitative capital.</span>
        </h1>

        <p className="hero-subheadline">
          Correlate second-by-second order flow with SEC vector embeddings, global supply chain shocks,
          and 10,000-run Monte Carlo risk simulations before consensus forms.
        </p>

        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={() => handleLaunchTerminal('NVDA')}>
            <Terminal size={17} />
            <span>Launch Live Terminal</span>
          </button>

          <a href="#sandbox" className="btn-hero-secondary">
            <Sliders size={15} />
            <span>Explore Interactive Sandbox</span>
          </a>
        </div>

        {/* KPI Strip */}
        <div className="kpi-strip">
          <div className="kpi-item">
            <div className="kpi-val">840 <span className="kpi-unit">μs</span></div>
            <div className="kpi-label">Tick-to-Causal Latency</div>
            <div className="kpi-sub">Direct OPRA Level 3 hardware capture</div>
          </div>

          <div className="kpi-item">
            <div className="kpi-val">10,000 <span className="kpi-unit">paths/s</span></div>
            <div className="kpi-label">Monte Carlo Throughput</div>
            <div className="kpi-sub">Wasm SIMD fat-tail stochastic core</div>
          </div>

          <div className="kpi-item">
            <div className="kpi-val">5.2 <span className="kpi-unit">M</span></div>
            <div className="kpi-label">SEC EDGAR Vectors</div>
            <div className="kpi-sub">Real-time 8-K & 10-Q semantic embeddings</div>
          </div>

          <div className="kpi-item">
            <div className="kpi-val">99.999 <span className="kpi-unit">%</span></div>
            <div className="kpi-label">Hard Real-time SLA</div>
            <div className="kpi-sub">Deterministic Zero-Allocation pipeline</div>
          </div>
        </div>
      </header>

      {/* ── Interactive Sandbox Section ── */}
      <section id="sandbox" className="sandbox-section">
        <div className="section-header">
          <span className="section-tag">
            <Sliders size={13} />
            <span>Live Interactive Cockpit</span>
          </span>
          <h2 className="section-title">Test the Verity engine directly in your browser.</h2>
          <p className="section-desc">
            Toggle between causal catalyst attribution, high-frequency Level 3 order books, and real-time Monte Carlo scenario shocks with zero latency.
          </p>
        </div>

        <SandboxCockpit onOpenTerminal={handleLaunchTerminal} />
      </section>

      {/* ── Quantitative Architecture Grid ── */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">
            <Cpu size={13} />
            <span>Quantitative Architecture</span>
          </span>
          <h2 className="section-title">Engineered without compromise for institutional alpha.</h2>
          <p className="section-desc">
            Legacy terminals present backwards-looking news feeds. Verity models the causal mechanics of price formation in real-time.
          </p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-code">[MOD-01 // VECTOR-INGEST]</span>
              <div className="feature-icon-wrapper">
                <Database size={18} />
              </div>
            </div>
            <h3 className="feature-title">Sub-Millisecond Catalyst Vectorization</h3>
            <p className="feature-desc">
              Ingests SEC EDGAR 8-K filings, earnings conference call audio transcripts, and FDA/patent dockets within 120ms of transmission. Maps textual surprises to high-dimensional embedding space to quantify historical price impact.
            </p>
            <div className="feature-specs-list">
              <div className="feature-spec-row">
                <span className="spec-k">Embedding Architecture</span>
                <span className="spec-v">HNSW 1536-dim Sparse-Dense</span>
              </div>
              <div className="feature-spec-row">
                <span className="spec-k">Filing Parse Latency</span>
                <span className="spec-v">&lt; 85 milliseconds</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-code">[MOD-02 // GRAPH-NEURAL]</span>
              <div className="feature-icon-wrapper">
                <GitBranch size={18} />
              </div>
            </div>
            <h3 className="feature-title">Global Causal Network Propagation</h3>
            <p className="feature-desc">
              Tracks over 40,000 public and private supply chain relationships across multi-tier supplier dependencies. An earthquake in Taiwan or a packaging yield bottleneck at TSMC instantly propagates downstream to hyperscaler capex forecasts.
            </p>
            <div className="feature-specs-list">
              <div className="feature-spec-row">
                <span className="spec-k">Node Graph Scale</span>
                <span className="spec-v">42,000 Nodes // 180,000 Edges</span>
              </div>
              <div className="feature-spec-row">
                <span className="spec-k">Inference Model</span>
                <span className="spec-v">Recursive Graph Convolution</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-code">[MOD-03 // STOCHASTIC-SIMD]</span>
              <div className="feature-icon-wrapper">
                <Cpu size={18} />
              </div>
            </div>
            <h3 className="feature-title">Monte Carlo Stochastic Scenario Engine</h3>
            <p className="feature-desc">
              Simulates 10,000+ stochastic price trajectories in real-time with Student-t fat tails, implied volatility smile deformation, and nonlinear liquidity constraints. Test "What-If" market shocks with dynamic VaR adjustments.
            </p>
            <div className="feature-specs-list">
              <div className="feature-spec-row">
                <span className="spec-k">Simulation Throughput</span>
                <span className="spec-v">100,000 paths in 14ms (SIMD)</span>
              </div>
              <div className="feature-spec-row">
                <span className="spec-k">Fat-Tail Correction</span>
                <span className="spec-v">Student-t (ν = 4.2 Degrees)</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-code">[MOD-04 // L3-MICROSTRUCTURE]</span>
              <div className="feature-icon-wrapper">
                <Activity size={18} />
              </div>
            </div>
            <h3 className="feature-title">OPRA L3 & Dark Venue Reconstruction</h3>
            <p className="feature-desc">
              Unifies fragmented order book feeds across direct exchange multicast feeds (NASDAQ ITCH, NYSE Integrated, Cboe Pitch) and FINRA TRF dark venues to detect hidden institutional iceberg sweeps and volume clusters.
            </p>
            <div className="feature-specs-list">
              <div className="feature-spec-row">
                <span className="spec-k">Capture Protocol</span>
                <span className="spec-v">Kernel-Bypass Solarflare EF_VI</span>
              </div>
              <div className="feature-spec-row">
                <span className="spec-k">Timestamp Precision</span>
                <span className="spec-v">PTP IEEE 1588 Nanoseconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Specs Benchmark Matrix ── */}
      <section id="specs" className="specs-section">
        <div className="section-header">
          <span className="section-tag">
            <Shield size={13} />
            <span>Benchmark Comparison</span>
          </span>
          <h2 className="section-title">Built for the next generation of quantitative finance.</h2>
          <p className="section-desc">
            A side-by-side technical evaluation against traditional legacy market data terminals.
          </p>
        </div>

        <div className="specs-table-card">
          <table className="specs-table">
            <thead>
              <tr>
                <th>ENGINE SPECIFICATION</th>
                <th>LEGACY TERMINALS (BLOOMBERG / REFINITIV)</th>
                <th>VERITY QUANTITATIVE TERMINAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="table-module-badge">Causal Attribution</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Mechanism connecting news to price action</div>
                </td>
                <td className="table-legacy-val">Manual headline reading / Keyword tags</td>
                <td className="table-verity-val">Deterministic Vector & Causal Graph AI</td>
              </tr>
              <tr>
                <td>
                  <div className="table-module-badge">Stress Testing & What-If</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Scenario simulation speed</div>
                </td>
                <td className="table-legacy-val">Static Excel plugins / Slow batch scripts</td>
                <td className="table-verity-val">Real-time 10,000-path Monte Carlo (1.4ms)</td>
              </tr>
              <tr>
                <td>
                  <div className="table-module-badge">Order Flow Ingestion</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Microstructure resolution</div>
                </td>
                <td className="table-legacy-val">Consolidated Tape (CTA / UTP) 200ms+</td>
                <td className="table-verity-val">OPRA L3 Hardware Bypass (840 μs)</td>
              </tr>
              <tr>
                <td>
                  <div className="table-module-badge">Supply Chain Graph</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Cross-company shock propagation</div>
                </td>
                <td className="table-legacy-val">Static annual report disclosures</td>
                <td className="table-verity-val">Recursive Graph Neural Network (40k nodes)</td>
              </tr>
              <tr>
                <td>
                  <div className="table-module-badge">Hallucination Immunity</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Source verification guarantee</div>
                </td>
                <td className="table-legacy-val">Unverified generative summaries</td>
                <td className="table-verity-val">Deterministic RAG with Cryptographic Citation Hashes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CLI Command Protocol Showcase ── */}
      <section id="cli" className="cli-section">
        <div className="section-header">
          <span className="section-tag">
            <Terminal size={13} />
            <span>Developer & Terminal Interface</span>
          </span>
          <h2 className="section-title">Scriptable, keyboard-driven, and developer-first.</h2>
          <p className="section-desc">
            Control the entire Verity system via keyboard shortcuts or integrate directly through high-speed WebSocket and FIX 4.4 APIs.
          </p>
        </div>

        <div className="cli-box">
          <div className="cli-header">
            <div className="cli-dots">
              <div className="cli-dot" />
              <div className="cli-dot" />
              <div className="cli-dot" />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>VERITY INTERACTIVE COMMAND REPL // v4.9.2</span>
          </div>

          <div className="cli-cmd-row">
            <span className="cli-prompt">$ verity</span>
            <span className="cli-text">--shock "NVDA" --catalyst "TSMC CoWoS Expansion" --paths 10000 --var 0.99</span>
            <span className="cli-comment"># Compute tail-risk impact</span>
          </div>

          <div className="cli-cmd-row">
            <span className="cli-prompt">$ verity</span>
            <span className="cli-text">--stream-opra --venue "DARK_POOL" --threshold 50000 --format json</span>
            <span className="cli-comment"># Stream institutional sweeps</span>
          </div>

          <div className="cli-cmd-row">
            <span className="cli-prompt">$ verity</span>
            <span className="cli-text">--graph-propagate --root "TSM" --shock -15% --depth 3</span>
            <span className="cli-comment"># Trace supply disruption</span>
          </div>
        </div>
      </section>

      {/* ── Call to Action Block ── */}
      <section className="landing-cta-block">
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-bright)',
          fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12
        }}>
          INSTITUTIONAL ACCESS AVAILABLE
        </span>
        <h2 style={{ fontSize: 36, fontWeight: 850, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
          Ready to experience the future of market intelligence?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 620, marginBottom: 32, lineHeight: 1.6 }}>
          Step directly into the Verity Terminal now. No registration required to explore live market simulations and causal catalyst timelines.
        </p>

        <button className="btn-hero-primary" onClick={() => handleLaunchTerminal('NVDA')}>
          <Zap size={18} />
          <span>Launch Verity Terminal Now</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 800, color: '#fff' }}>VERITY INTELLIGENCE</span>
            <span>•</span>
            <span>BUILD HASH: 9f8a42b</span>
            <span>•</span>
            <span style={{ color: 'var(--green-bright)' }}>ALL SYSTEMS DETERMINISTIC</span>
          </div>

          <div>
            <span>© 2026 Verity Quant Technologies Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
