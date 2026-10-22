import { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Zap, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Globe, RefreshCw } from 'lucide-react';
import { WATCHLIST, CATALYST_FEED } from '../data/marketData';
import { useVerity } from '../context/VerityContext';
import { fetchExchangeStocks } from '../services/exchangeApi';

/* ── Sentiment Gauge ────────────────────────────── */
function SentimentGauge({ value = 68 }) {
  const r = 32, cx = 45, cy = 42;
  const rad = (d) => (d * Math.PI) / 180;
  const filled = (value / 100) * 180;
  const x1 = cx + r * Math.cos(rad(-180)), y1 = cy + r * Math.sin(rad(-180));
  const x2 = cx + r * Math.cos(rad(filled - 180)), y2 = cy + r * Math.sin(rad(filled - 180));
  const large = filled > 180 ? 1 : 0;
  const nx = cx + (r - 7) * Math.cos(rad(filled - 180));
  const ny = cy + (r - 7) * Math.sin(rad(filled - 180));
  const color = value >= 60 ? 'var(--green-bright)' : value >= 45 ? 'var(--amber-bright)' : 'var(--red-bright)';
  const label = value >= 60 ? 'GREED' : value >= 45 ? 'NEUTRAL' : 'FEAR';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', gap: '8px' }}>
      <svg width="90" height="52" viewBox="0 0 90 52">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill="white" />
        <text x={cx} y={cy + 9} textAnchor="middle" fill={color}
          fontSize={13} fontWeight={800} fontFamily="var(--font-mono)">{value}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Prev: 62 Neutral</span>
        <span style={{ fontSize: '9px', color: 'var(--cyan-bright)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>+6 pts vs 7D</span>
      </div>
    </div>
  );
}

/* ── Index Card ─────────────────────────────────── */
function IndexCard({ title, symbol, price, changePct, sparkData, isGauge, isLast }) {
  if (isGauge) {
    return (
      <div style={{
        padding: '8px 14px',
        height: '76px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'transparent',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Market Sentiment
        </div>
        <SentimentGauge value={68} />
      </div>
    );
  }

  const isUp = changePct >= 0;
  const spark = (sparkData || []).map(v => ({ v }));
  const gradId = `sparkGrad-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div style={{
      padding: '8px 14px',
      height: '76px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: isLast ? 'none' : '1px solid var(--border-subtle)',
      background: 'transparent',
      position: 'relative',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            {title}
          </span>
          {symbol && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({symbol})
            </span>
          )}
        </div>
        <div style={{
          fontSize: '10.5px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: isUp ? 'var(--green-bright)' : 'var(--red-bright)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {isUp ? '+' : ''}{changePct.toFixed(2)}%
        </div>
      </div>

      {/* Middle row: Price and Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text-primary)' }}>
          {price}
        </div>
        {spark.length > 0 && (
          <div style={{ width: '74px', height: '22px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? 'var(--green)' : 'var(--red)'} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={isUp ? 'var(--green)' : 'var(--red)'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={isUp ? 'var(--green-bright)' : 'var(--red-bright)'}
                  strokeWidth={1.5}
                  fill={`url(#${gradId})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sparkline ──────────────────────────────────── */
function Spark({ data, up, id }) {
  const gradId = `spark-${id || (up ? 'up' : 'down')}`;
  return (
    <ResponsiveContainer width={76} height={22}>
      <AreaChart data={(data || []).map(v => ({ v }))}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? 'var(--green)' : 'var(--red)'} stopOpacity={0.35} />
            <stop offset="100%" stopColor={up ? 'var(--green)' : 'var(--red)'} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" dot={false}
          stroke={up ? 'var(--green-bright)' : 'var(--red-bright)'} strokeWidth={1.5}
          fill={`url(#${gradId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Watchlist Row ──────────────────────────────── */
function WLRow({ item, active, onSelect, onDrillIn }) {
  const up = item.changePct >= 0;
  const tagColor = {
    Supply: '#818cf8', Product: '#60a5fa', Legal: '#f87171',
    Earnings: '#c084fc', Macro: '#fbbf24', Analyst: '#34d399', Cloud: '#93c5fd'
  };
  const tc = tagColor[item.tags[0]] || '#60a5fa';

  return (
    <div
      className={`wl-row ${active ? 'active' : ''}`}
      onClick={() => onSelect(item.id)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(130px, 1.2fr) 100px 90px 75px 65px',
        alignItems: 'center',
        padding: '9px 14px',
        borderBottom: '1px solid var(--border-faint)',
        transition: 'background var(--t-fast)',
        cursor: 'pointer',
      }}
    >
      {/* Asset info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '5px',
          background: active ? 'var(--cyan-dark)' : 'var(--bg-card-alt)',
          border: `1px solid ${active ? 'var(--cyan)' : 'var(--border-subtle)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 800,
          color: active ? '#ffffff' : 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          {item.symbol.slice(0, 2)}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: active ? 'var(--cyan-bright)' : 'var(--text-primary)' }}>
              {item.symbol}
            </span>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: up ? 'var(--green-bright)' : 'var(--red-bright)' }} />
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </div>
        </div>
      </div>

      {/* Price & Change */}
      <div style={{ textAlign: 'right', paddingRight: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {item.currencySymbol || '$'}{item.price.toFixed(2)}
        </div>
        <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: up ? 'var(--green-bright)' : 'var(--red-bright)', fontWeight: 600 }}>
          {up ? '+' : ''}{item.changePct.toFixed(2)}%
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spark data={item.sparkData} up={up} id={item.id} />
      </div>

      {/* Tag */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '2px 7px', borderRadius: '3px',
          background: `${tc}15`, color: tc, border: `1px solid ${tc}30`,
        }}>
          {item.tags[0]}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
        <button
          className="btn btn-ghost btn-xs"
          title="Inspect Catalyst Timeline"
          onClick={(e) => { e.stopPropagation(); onDrillIn(item.id); }}
          style={{ padding: '3px 6px', fontSize: '10px' }}
        >
          Inspect
        </button>
      </div>
    </div>
  );
}

/* ── Catalyst Feed Item ─────────────────────────── */
function CatalystItem({ item, onAnalyze }) {
  const up = item.direction === 'bullish';
  return (
    <div className="catalyst-item" style={{
      padding: '12px 14px',
      borderBottom: '1px solid var(--border-faint)',
      transition: 'background var(--t-fast)',
    }}>
      {/* Top Wire info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.time}</span>
        <span style={{
          fontSize: '9.5px', fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255, 255, 255, 0.03)', padding: '1px 6px', borderRadius: '3px',
          border: '1px solid var(--border-faint)',
        }}>
          Bloomberg Wire
        </span>
        <span style={{
          fontSize: '9.5px', color: 'var(--cyan-bright)', background: 'var(--cyan-bg)',
          padding: '1px 6px', borderRadius: '3px', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          SEC 8-K
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: up ? 'var(--green-bright)' : 'var(--red-bright)',
            background: up ? 'var(--green-bg)' : 'var(--red-bg)',
            padding: '2px 7px', borderRadius: '3px',
            border: `1px solid ${up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
          }}>
            {up ? '▲' : '▼'} {item.priceMove} {up ? 'Bullish' : 'Bearish'}
          </span>
        </div>
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{
          fontSize: '12.5px', fontWeight: 800, fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)', flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.04)', padding: '2px 6px', borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
        }}>
          {item.ticker}
        </span>
        <p style={{ fontSize: '12.5px', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
          {item.headline}
        </p>
      </div>

      {/* Influence bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Catalyst Influence Score
          </span>
          <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)', fontWeight: 700 }}>
            {item.confidence} / 100
          </span>
        </div>
        <div className="progress-bar" style={{ height: '3px', background: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="progress-fill" style={{
            width: `${item.confidence}%`,
            background: item.confidence > 75 ? 'var(--cyan)' : 'var(--amber)',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button className="btn btn-ghost btn-xs" onClick={() => onAnalyze(item.ticker)}>
          Copilot Query
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-accent btn-xs" onClick={() => onAnalyze(item.ticker)}>
          Simulate in What-If →
        </button>
      </div>
    </div>
  );
}

/* ── Index Cards config ─────────────────────────── */
const CARDS = [
  { title: 'S&P 500 ETF', exchange: 'NYSE', symbol: 'SPY', price: '512.40', changePct: 0.82, sparkData: [506, 507, 508, 509, 510, 510, 511, 512, 511, 512] },
  { title: 'NASDAQ 100', exchange: 'NDX', symbol: 'QQQ', price: '448.15', changePct: 1.24, sparkData: [442, 443, 444, 444, 445, 446, 446, 447, 448, 448] },
  { title: 'US 10-Yr Yield', exchange: '', symbol: 'TNX', price: '4.28%', changePct: -0.07, sparkData: [4.31, 4.30, 4.29, 4.29, 4.28, 4.28, 4.29, 4.28, 4.28, 4.28] },
  { title: 'CBOE Volatility', exchange: '', symbol: 'VIX', price: '13.42', changePct: -4.80, sparkData: [14.2, 14.0, 13.8, 13.6, 13.7, 13.5, 13.4, 13.5, 13.4, 13.4] },
  { isGauge: true },
];

const WL_TABS = ['All Watchlist', 'Exchange (All Stocks)', 'Top Gainers', 'Unusual Volume', 'High News Impact'];
const CAT_FILTERS = ['All Catalysts', 'Earnings', 'Analyst', 'Breaking M&A', 'Regulatory'];

export default function Dashboard() {
  const { activeTicker, selectTicker, navigateTo, searchQuery } = useVerity();
  const [wlTab, setWlTab] = useState(0);
  const [catFilter, setCatFilter] = useState(0);
  const [exchangeStocks, setExchangeStocks] = useState([]);
  const [loadingExchange, setLoadingExchange] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadExchange() {
      setLoadingExchange(true);
      try {
        const stocks = await fetchExchangeStocks();
        if (isMounted) {
          // Filter out the 5-6 core watchlist stocks to show all other exchange stocks
          const coreSymbols = new Set(WATCHLIST.map(w => w.symbol.toUpperCase()));
          const extraStocks = stocks.filter(s => !coreSymbols.has(s.symbol.toUpperCase()));
          setExchangeStocks(extraStocks);
        }
      } catch (err) {
        console.error('Failed to load exchange stocks:', err);
      } finally {
        if (isMounted) setLoadingExchange(false);
      }
    }
    loadExchange();
    return () => { isMounted = false; };
  }, []);

  const handleAnalyze = (ticker) => { selectTicker(ticker); navigateTo('whatif'); };
  const handleDrillIn = (ticker) => { selectTicker(ticker); navigateTo('analysis'); };

  // Filtered Watchlist
  const filteredWatchlist = useMemo(() => {
    let list;
    if (wlTab === 1) {
      // Show all board of exchange stocks
      list = exchangeStocks.slice(0, 100); // paginate / show top exchange items
    } else {
      list = [...WATCHLIST];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const source = wlTab === 1 ? exchangeStocks : list;
      list = source.filter(w =>
        w.symbol.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (wlTab === 2) {
      list = [...list].sort((a, b) => b.changePct - a.changePct);
    } else if (wlTab === 3) {
      list = list.filter(w => parseFloat(w.volume) > 50);
    } else if (wlTab === 4) {
      list = list.filter(w => w.tags?.includes('Product') || w.tags?.includes('Supply') || w.tags?.includes('Earnings'));
    }
    return list;
  }, [searchQuery, wlTab, exchangeStocks]);

  // Filtered Catalyst Feed
  const filteredFeed = useMemo(() => {
    let feed = [...CATALYST_FEED];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      feed = feed.filter(c =>
        c.ticker.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q)
      );
    }
    if (catFilter === 1) feed = feed.filter(c => c.headline.toLowerCase().includes('margin') || c.headline.toLowerCase().includes('earnings') || c.headline.toLowerCase().includes('q3'));
    else if (catFilter === 2) feed = feed.filter(c => c.headline.toLowerCase().includes('upgrade') || c.headline.toLowerCase().includes('target') || c.headline.toLowerCase().includes('bofa'));
    else if (catFilter === 3) feed = feed.filter(c => c.headline.toLowerCase().includes('supply') || c.headline.toLowerCase().includes('deal'));
    else if (catFilter === 4) feed = feed.filter(c => c.headline.toLowerCase().includes('sec') || c.headline.toLowerCase().includes('doj') || c.headline.toLowerCase().includes('antitrust'));
    return feed;
  }, [searchQuery, catFilter]);

  return (
    <div style={{
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* ── Top Flush Tiled Index Ribbon ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {CARDS.map((c, i) => <IndexCard key={i} {...c} isLast={i === CARDS.length - 1} />)}
      </div>

      {/* ── Main Two-Column Panel Area ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        gap: '8px',
        flex: 1,
        minHeight: 0,
      }}>
        {/* LEFT — Watchlist Engine Panel */}
        <div className="panel" style={{ height: '100%', borderRadius: '2px' }}>
          {/* Header */}
          <div className="panel-header" style={{ height: '36px', padding: '0 12px' }}>
            <div className="panel-title" style={{ fontSize: '12.5px' }}>
              <Activity size={13} color="var(--cyan-bright)" />
              <span>Watchlist Engine</span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                marginLeft: '4px',
              }}>
                [{filteredWatchlist.length}]
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(16, 185, 129, 0.08)', padding: '2px 6px', borderRadius: '2px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}>
                <div className="live-dot" style={{ width: 5, height: 5 }} />
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--green-bright)' }}>REAL-TIME</span>
              </div>
            </div>
          </div>

          {/* Tab Filter Bar (Underline Tabs) */}
          <div style={{
            padding: '0 8px',
            background: 'var(--bg-card-alt)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0',
            flexShrink: 0,
          }}>
            {WL_TABS.map((t, i) => (
              <button
                key={t}
                className={`pill-tab ${wlTab === i ? 'active' : ''}`}
                onClick={() => setWlTab(i)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Table Column Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(130px, 1.2fr) 100px 90px 75px 65px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.015)',
            borderBottom: '1px solid var(--border-faint)',
            flexShrink: 0,
          }}>
            {['ASSET', 'PRICE / 24H', 'TREND 24H', 'CATEGORY', 'ACTION'].map((h, i) => (
              <span key={h} style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                textAlign: i === 1 ? 'right' : i >= 2 ? 'center' : 'left',
                paddingRight: i === 1 ? '8px' : 0,
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows Body */}
          <div className="panel-body">
            {loadingExchange && wlTab === 1 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <RefreshCw size={14} className="spin" style={{ color: 'var(--cyan-bright)' }} />
                  <span>Connecting to Board of Exchange (SEC EDGAR Live Directory)...</span>
                </div>
              </div>
            ) : filteredWatchlist.length > 0 ? (
              filteredWatchlist.map(item => (
                <WLRow
                  key={item.id}
                  item={item}
                  active={activeTicker === item.id}
                  onSelect={selectTicker}
                  onDrillIn={handleDrillIn}
                  onAnalyze={handleAnalyze}
                />
              ))
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No assets matched your search query.
              </div>
            )}
          </div>

          {/* Panel Footer Banner */}
          <div className="panel-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={13} color="var(--cyan)" />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Unusual Order Flow Detected
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                2.3σ on NVDA $134C (Exp Nov)
              </span>
            </div>
            <button className="btn btn-accent btn-xs" onClick={() => handleDrillIn('NVDA')}>
              Inspect L3 Flow →
            </button>
          </div>
        </div>

        {/* RIGHT — Live Catalyst Feed Panel */}
        <div className="panel" style={{ height: '100%', borderRadius: '2px' }}>
          {/* Header */}
          <div className="panel-header" style={{ height: '36px', padding: '0 12px' }}>
            <div className="panel-title" style={{ fontSize: '12.5px' }}>
              <Zap size={14} color="var(--amber)" />
              <span>Live Catalyst Intelligence Feed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>SORT:</span>
              <span style={{ fontSize: '10px', color: 'var(--cyan-bright)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                IMPACT %
              </span>
            </div>
          </div>

          {/* Subheader and Filters (Underline Tabs) */}
          <div style={{
            padding: '0 8px',
            background: 'var(--bg-card-alt)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '0' }}>
              {CAT_FILTERS.map((f, i) => (
                <button
                  key={f}
                  className={`pill-tab ${catFilter === i ? 'active' : ''}`}
                  onClick={() => setCatFilter(i)}
                >
                  {f}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingRight: '8px' }}>
              [{filteredFeed.length} EVENTS]
            </span>
          </div>

          {/* Catalyst Feed Items */}
          <div className="panel-body">
            {filteredFeed.length > 0 ? (
              filteredFeed.map(item => (
                <CatalystItem key={item.id} item={item} onAnalyze={handleAnalyze} />
              ))
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No catalyst events match current filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
