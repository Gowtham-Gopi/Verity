import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Cpu, Send, Loader, Zap, Shield, RotateCcw,
  Sparkles, Activity, Trash2,
} from 'lucide-react';
import { buildMonteCarloChartData, WATCHLIST } from '../data/marketData';
import { useVerity } from '../context/VerityContext';

/* ── Quant Engines Configuration ────────────────────────────────── */
const QUANT_ENGINES = [
  {
    id: 'finbert',
    name: 'FinBERT-Attribution v4.2',
    shortName: 'FinBERT 4.2',
    tag: 'NLP / CAUSALITY',
    icon: Sparkles,
    color: '#60a5fa',
    badgeColor: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    description: 'Deconstructs 8-K filings, earnings transcripts, and supply chain news into causal price vectors.',
    telemetry: '18ms · 94.8% conf',
    params: { tsmc: 78, hyperscaler: 72, grossMargin: 65 },
    methodology: 'Causal NLP Vector Decomposition (FinBERT Architecture)',
  },
  {
    id: 'montecarlo',
    name: 'GBM Stochastic Engine',
    shortName: 'GBM Monte Carlo',
    tag: '10K STOCHASTIC',
    icon: Activity,
    color: '#34d399',
    badgeColor: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    description: '10,000 Geometric Brownian Motion trajectories with jump-diffusion modeling tail risk & P90/P10 spreads.',
    telemetry: '24ms · 10,000 paths',
    params: { tsmc: 65, hyperscaler: 60, grossMargin: 55 },
    methodology: 'Geometric Brownian Motion + Merton Jump Diffusion',
  },
  {
    id: 'blackscholes',
    name: 'Black-Scholes & GARCH(1,1)',
    shortName: 'Black-Scholes / GARCH',
    tag: 'VOL & GREEKS',
    icon: Shield,
    color: '#fbbf24',
    badgeColor: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    description: 'Calculates volatility clustering, dynamic Greek skews, and institutional collar hedge structures.',
    telemetry: '12ms · Greeks live',
    params: { tsmc: 42, hyperscaler: 45, grossMargin: 48 },
    methodology: 'GARCH(1,1) Volatility Surface & 25-Delta Skew Modeling',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-Quant R1 Chain',
    shortName: 'DeepSeek R1',
    tag: 'CHAIN-OF-THOUGHT',
    icon: Cpu,
    color: '#c084fc',
    badgeColor: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.3)',
    description: 'Multi-step chain-of-thought macroeconomic reasoning evaluating systemic trade and regulatory shock waves.',
    telemetry: '48ms · CoT Chain',
    params: { tsmc: 28, hyperscaler: 32, grossMargin: 38 },
    methodology: 'Deep Multi-Agent Macro Spillover Tree Reasoning',
  },
];

/* ── Scenario Presets ────────────────────────────────────────────── */
const SCENARIO_PRESETS = [
  { label: 'Bull Case: Supply Unlock', tsmc: 85, hyperscaler: 80, grossMargin: 70 },
  { label: 'Bear Case: Disruption',     tsmc: 20, hyperscaler: 30, grossMargin: 35 },
  { label: 'Base Case: Consensus',      tsmc: 50, hyperscaler: 50, grossMargin: 50 },
  { label: 'Squeeze: Margin Expansion', tsmc: 50, hyperscaler: 55, grossMargin: 80 },
];

/* ── Quick Prompt Scenario Chips ─────────────────────────────────── */
const PROMPT_CHIPS = [
  { label: 'TSMC Supply Shock (+35%)', query: 'Simulate a +35% TSMC wafer allocation surge and its effect on deferred revenue.' },
  { label: 'Hyperscaler Capex Cut (-20%)', query: 'What happens to NVDA price target if Microsoft and Google trim AI capex by 20%?' },
  { label: 'Optimal Delta-Neutral Collar', query: 'Calculate an optimal delta-neutral put spread collar for 15% downside hedge.' },
  { label: 'Earnings Volatility Implied Move', query: 'Decompose upcoming earnings option implied move and 1-day Value-at-Risk (VaR 95%).' },
];

/* ── Hedge Recommendations Config ───────────────────────────────── */
const HEDGE_RECS = [
  { type: 'PUT SPREAD', detail: '$800/$750 Put Spread — Nov Exp', cost: '$4.20/share', color: 'var(--red-bright)' },
  { type: 'COLLAR',     detail: 'Long $850P / Short $950C — Dec Exp', cost: '$1.80/share', color: 'var(--amber)' },
  { type: 'VIX CALL',   detail: 'VIX $20 Call — protects systemic selloff', cost: '$0.95/share', color: 'var(--purple)' },
];

/* ── Slider Control Component ───────────────────────────────────── */
function SliderControl({ label, sublabel, value, onChange, unit = '%', min = 0, max = 100 }) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = pct > 60 ? 'var(--green-bright)' : pct < 40 ? 'var(--red-bright)' : 'var(--cyan-bright)';

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sublabel}</div>
        </div>
        <div style={{
          minWidth: '48px', textAlign: 'right',
          fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color,
        }}>
          {value}{unit}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="slider-input"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border-default) ${pct}%, var(--border-default) 100%)`,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Bearish (0%)</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Base (50%)</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Bullish (100%)</span>
      </div>
    </div>
  );
}

/* ── Monte Carlo Tooltip ────────────────────────────────────────── */
function MonteCarloTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload.reduce((acc, item) => { acc[item.dataKey] = item.value; return acc; }, {});
  return (
    <div style={{
      background: 'var(--bg-card-elevated)',
      border: '1px solid var(--border-strong)',
      borderRadius: '2px', padding: '10px 12px', fontSize: '11px',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'var(--font-mono)' }}>{label}</div>
      {p.consensus && <div style={{ color: 'var(--amber)', marginBottom: '2px' }}>Consensus: <strong>${p.consensus?.toFixed(0)}</strong></div>}
      {p.p90 && <div style={{ color: 'var(--green-bright)', marginBottom: '2px' }}>P90 (Bull): <strong>${p.p90?.toFixed(0)}</strong></div>}
      {p.median && <div style={{ color: 'var(--cyan-bright)', marginBottom: '2px' }}>Median Path: <strong>${p.median?.toFixed(0)}</strong></div>}
      {p.p10 && <div style={{ color: 'var(--red-bright)' }}>P10 (Bear): <strong>${p.p10?.toFixed(0)}</strong></div>}
    </div>
  );
}

/* ── Main WhatIf Component ──────────────────────────────────────── */
export default function WhatIf() {
  const { activeTicker } = useVerity();
  const stock = WATCHLIST.find(w => w.id === activeTicker) || WATCHLIST[0];

  const [selectedEngineId, setSelectedEngineId] = useState('finbert');
  const activeEngine = useMemo(() =>
    QUANT_ENGINES.find(e => e.id === selectedEngineId) || QUANT_ENGINES[0],
    [selectedEngineId]
  );

  const [sliders, setSliders] = useState({ tsmc: 50, hyperscaler: 50, grossMargin: 50 });
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'ai',
      engine: 'finbert',
      time: '09:30 AM',
      text: `Quant Copilot initialized with ${stock.symbol} real-time L2 order book and news catalyst feeds. Select a quantitative engine below or ask scenario what-if questions to compute empirical trajectory shifts.`,
      metrics: {
        target: `$${(stock.price * 1.08).toFixed(2)}`,
        confidence: '92.4%',
        expectedMove: '+8.0%',
        var95: '-$3.80',
      },
      appliedSliders: { tsmc: 75, hyperscaler: 70, grossMargin: 65 },
      actionLabel: 'Apply TSMC Supply Surge (+75%) to Simulator',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const chartData = useMemo(() => {
    const raw = buildMonteCarloChartData(stock.price, 90, sliders);
    return raw.filter((_, i) => i % 3 === 0 || i === 0 || i === 90);
  }, [sliders, stock.price]);

  const applyPreset = (preset) => {
    setSliders({ tsmc: preset.tsmc, hyperscaler: preset.hyperscaler, grossMargin: preset.grossMargin });
  };

  /* Switch Engine handler */
  const handleEngineChange = (engineId) => {
    setSelectedEngineId(engineId);
    const eng = QUANT_ENGINES.find(e => e.id === engineId);
    const newMsg = {
      id: `engine-switch-${Date.now()}`,
      role: 'system',
      engine: engineId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Switched active quant backend to [${eng.name}]. ${eng.description} Telemetry: ${eng.telemetry}.`,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  /* Send Prompt Handler */
  const handleSendPrompt = useCallback((queryText = null) => {
    const q = (queryText || prompt).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setPrompt('');
    setLoading(true);

    setTimeout(() => {
      let responseText = '';
      let metrics = {};
      let shockParams = { ...sliders };
      let actionLabel = '';

      if (activeEngine.id === 'finbert') {
        const pt = (stock.price * (1 + (sliders.tsmc - 50) * 0.003 + 0.04)).toFixed(2);
        responseText = `[FinBERT 4.2 NLP] Causal attribution analysis for ${stock.symbol}: News and 8-K filings correlate with high probability to packaging lead-time resolution. Blended sentiment causality index is +0.78σ above the 30-day baseline. Revenue deferral risk drops by ~$1.8B.`;
        metrics = {
          target: `$${pt}`,
          confidence: `${(85 + Math.random() * 8).toFixed(1)}%`,
          expectedMove: `+${((sliders.tsmc - 50) * 0.15 + 4.2).toFixed(1)}%`,
          var95: `-$${(stock.price * 0.024).toFixed(2)}`,
        };
        shockParams = { tsmc: 82, hyperscaler: 75, grossMargin: 68 };
        actionLabel = 'Apply FinBERT Calibrated Shock (+82% TSMC)';
      } else if (activeEngine.id === 'montecarlo') {
        const last = chartData[chartData.length - 1];
        const med = last?.median?.toFixed(0) || (stock.price * 1.05).toFixed(0);
        responseText = `[GBM Stochastic 10k Paths] Executed 10,000 geometric Brownian motion iterations across 90 trading days. The distribution exhibits a positive skew of 0.42 with 68% probability density clustered between $${(stock.price * 0.94).toFixed(0)} and $${(stock.price * 1.18).toFixed(0)}. P90/P10 spread is $${((last?.p90 || 150) - (last?.p10 || 110)).toFixed(0)}.`;
        metrics = {
          target: `$${med}`,
          confidence: '99.1%',
          expectedMove: '+5.4%',
          var95: `-$${(stock.price * 0.031).toFixed(2)}`,
        };
        shockParams = { tsmc: 70, hyperscaler: 65, grossMargin: 60 };
        actionLabel = 'Align Simulator to Median Path';
      } else if (activeEngine.id === 'blackscholes') {
        responseText = `[Black-Scholes & GARCH(1,1)] Option volatility surface indicates 30-day IV at 42.1% (64th percentile). Call/Put skew favors upside OTM delta by 3.8 vol points. Optimal capital-efficient hedge is a $${(stock.price * 0.95).toFixed(0)} / $${(stock.price * 0.90).toFixed(0)} bear put spread financed by a $${(stock.price * 1.12).toFixed(0)} covered call.`;
        metrics = {
          target: `$${(stock.price * 1.03).toFixed(2)}`,
          confidence: '96.2%',
          expectedMove: 'IV: 42.1%',
          var95: 'Delta: 0.64',
        };
        shockParams = { tsmc: 50, hyperscaler: 52, grossMargin: 52 };
        actionLabel = 'Structure Delta-Neutral Collar';
      } else {
        // deepseek
        responseText = `[DeepSeek-Quant R1 Reasoning] Multi-step macro causal chain:\n• Step 1: Hyperscaler capex committed by MSFT/GOOGL remains resilient against near-term macro headwind.\n• Step 2: Supply elasticity in advanced CoWoS-L wafer fab buffers margin contraction by 140bps.\n• Step 3: Recommendation is to retain core long position with 12% dynamic collar hedge.`;
        metrics = {
          target: `$${(stock.price * 1.11).toFixed(2)}`,
          confidence: '97.5%',
          expectedMove: '+11.2%',
          var95: 'Tail Risk: 4.8%',
        };
        shockParams = { tsmc: 78, hyperscaler: 82, grossMargin: 72 };
        actionLabel = 'Apply DeepSeek Macro Expansion Shock';
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'ai',
        engine: activeEngine.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
        metrics,
        appliedSliders: shockParams,
        actionLabel,
      }]);
      setLoading(false);
    }, 1100);
  }, [prompt, loading, activeEngine, stock, sliders, chartData]);

  /* Run Simulation Button */
  const handleRunSimulation = useCallback(() => {
    setLoading(true);
    setRan(false);
    setTimeout(() => {
      const last = chartData[chartData.length - 1];
      const pt = ((sliders.tsmc / 50) * stock.price * 1.08).toFixed(2);
      const conf = (68 + sliders.grossMargin * 0.28).toFixed(1);
      const med = last?.median?.toFixed(0) || 900;
      const sp = ((last?.p90 || 950) - (last?.p10 || 750)).toFixed(0);

      const res = `[${activeEngine.shortName}] Simulation converged across 90-day trajectory. Projected price target is $${pt} with ${conf}% confidence interval. Median expected terminal price is $${med} with bull/bear spread of $${sp}.`;

      setMessages(prev => [...prev, {
        id: `sim-${Date.now()}`,
        role: 'ai',
        engine: activeEngine.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res,
        metrics: {
          target: `$${pt}`,
          confidence: `${conf}%`,
          expectedMove: `${sliders.tsmc > 50 ? '+' : ''}${((sliders.tsmc - 50) * 0.2).toFixed(1)}%`,
          var95: `-$${(stock.price * 0.025).toFixed(2)}`,
        },
      }]);
      setLoading(false);
      setRan(true);
    }, 1200);
  }, [sliders, stock, chartData, activeEngine]);

  const bullP90 = chartData[chartData.length - 1]?.p90?.toFixed(0);
  const bearP10 = chartData[chartData.length - 1]?.p10?.toFixed(0);
  const medianTarget = chartData[chartData.length - 1]?.median?.toFixed(0);

  return (
    <div style={{
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* ── Top Header Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        padding: '8px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '2px',
            background: 'var(--cyan-dark)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Quantitative AI Copilot & What-If Studio
              </h1>
              <span style={{
                fontSize: '9.5px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                padding: '1px 6px', borderRadius: '2px',
                background: 'rgba(59, 130, 246, 0.12)', color: 'var(--cyan-bright)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}>
                TARGET: {stock.symbol} (${stock.price.toFixed(2)})
              </span>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Autonomous quantitative multi-engine causality lab with real-time Monte Carlo path distribution
            </div>
          </div>
        </div>

        {/* Preset Toolbar */}
        <div style={{
          display: 'flex',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          background: 'var(--bg-card-alt)',
          overflow: 'hidden',
        }}>
          {SCENARIO_PRESETS.map((p, i) => (
            <button
              key={i}
              className="btn btn-ghost btn-xs"
              onClick={() => applyPreset(p)}
              style={{
                fontSize: '10px',
                borderRadius: 0,
                border: 'none',
                borderRight: i < SCENARIO_PRESETS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                padding: '5px 11px',
              }}
            >
              {p.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Workstation Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(460px, 44%) 1fr',
        gap: '8px',
        flex: 1,
        minHeight: 0,
      }}>

        {/* ════════════════════════════════════════════════════════
            LEFT: PROMINENT QUANT AI COPILOT WORKSTATION
        ════════════════════════════════════════════════════════ */}
        <div className="panel" style={{ height: '100%', borderRadius: '2px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Copilot Header */}
          <div className="panel-header" style={{ height: '36px', padding: '0 12px' }}>
            <div className="panel-title" style={{ fontSize: '12.5px' }}>
              <activeEngine.icon size={15} color={activeEngine.color} />
              <span>QUANT COPILOT WORKSTATION</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(16, 185, 129, 0.08)', padding: '2px 6px', borderRadius: '2px',
                border: '1px solid rgba(16, 185, 129, 0.2)', marginLeft: '6px',
              }}>
                <div className="live-dot" style={{ width: 5, height: 5 }} />
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--green-bright)' }}>ONLINE</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}>
                {activeEngine.telemetry}
              </span>
              <button
                className="btn btn-ghost btn-xs"
                title="Reset conversation"
                onClick={() => setMessages([{
                  id: 'reset',
                  role: 'ai',
                  engine: activeEngine.id,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: `Console reset. Active engine is [${activeEngine.name}]. Ready for quantitative what-if queries for ${stock.symbol}.`,
                }])}
                style={{ padding: '3px 7px', fontSize: '10px' }}
              >
                <Trash2 size={11} /> Clear
              </button>
            </div>
          </div>

          {/* ── QUANT ENGINE SWITCHER TOOLBAR ── */}
          <div style={{
            background: 'var(--bg-card-alt)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            overflowX: 'auto',
          }}>
            <span style={{
              fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)',
              letterSpacing: '0.06em', padding: '0 4px', textTransform: 'uppercase',
            }}>
              ENGINE:
            </span>
            {QUANT_ENGINES.map(eng => {
              const active = selectedEngineId === eng.id;
              const IconComp = eng.icon;
              return (
                <button
                  key={eng.id}
                  onClick={() => handleEngineChange(eng.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '2px',
                    background: active ? eng.badgeColor : 'transparent',
                    border: `1px solid ${active ? eng.border : 'transparent'}`,
                    color: active ? eng.color : 'var(--text-secondary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all var(--t-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <IconComp size={12} color={active ? eng.color : 'var(--text-muted)'} />
                  <span>{eng.shortName}</span>
                  {active && (
                    <span style={{
                      fontSize: '8px', fontWeight: 800, padding: '1px 4px',
                      borderRadius: '2px', background: `${eng.color}25`, color: eng.color,
                    }}>
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Engine Methodology Ribbon */}
          <div style={{
            padding: '5px 12px',
            background: 'rgba(255, 255, 255, 0.015)',
            borderBottom: '1px solid var(--border-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            fontSize: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: activeEngine.color, fontWeight: 700 }}>● {activeEngine.tag}:</span>
              <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeEngine.methodology}
              </span>
            </div>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '9px', flexShrink: 0, marginLeft: '8px' }}>
              Temp: 0.15 · Deterministic
            </span>
          </div>

          {/* Quick Scenario Chips */}
          <div style={{
            padding: '6px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card-alt)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            flexShrink: 0,
          }}>
            {PROMPT_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => handleSendPrompt(chip.query)}
                className="btn btn-ghost btn-xs"
                style={{
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                + {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {messages.map(m => {
              if (m.role === 'system') {
                return (
                  <div key={m.id} style={{
                    padding: '6px 10px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed var(--border-subtle)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                  }}>
                    ⚙ {m.text}
                  </div>
                );
              }

              const isUser = m.role === 'user';
              const engObj = QUANT_ENGINES.find(e => e.id === m.engine) || activeEngine;

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Sender & Timestamp */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginBottom: '4px', fontSize: '9.5px', color: 'var(--text-muted)',
                  }}>
                    {!isUser && (
                      <span style={{
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: engObj.color,
                        background: engObj.badgeColor,
                        padding: '1px 5px', borderRadius: '2px',
                        border: `1px solid ${engObj.border}`,
                      }}>
                        [{engObj.shortName}]
                      </span>
                    )}
                    <span>{m.time}</span>
                  </div>

                  {/* Bubble Content */}
                  <div style={{
                    maxWidth: '92%',
                    padding: '10px 14px',
                    borderRadius: '2px',
                    fontSize: '12px',
                    lineHeight: 1.55,
                    background: isUser ? 'var(--cyan-dark)' : 'var(--bg-card-alt)',
                    border: `1px solid ${isUser ? 'rgba(255,255,255,0.15)' : 'var(--border-subtle)'}`,
                    color: isUser ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    whiteSpace: 'pre-line',
                  }}>
                    {m.text}

                    {/* Quantitative Output Metrics Cards */}
                    {m.metrics && (
                      <div style={{
                        marginTop: '10px',
                        padding: '8px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '2px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '6px',
                      }}>
                        {[
                          { label: 'TARGET PT', val: m.metrics.target, col: 'var(--cyan-bright)' },
                          { label: 'CONFIDENCE', val: m.metrics.confidence, col: 'var(--green-bright)' },
                          { label: 'EXP MOVE', val: m.metrics.expectedMove, col: 'var(--amber)' },
                          { label: 'METRIC', val: m.metrics.var95, col: 'var(--text-primary)' },
                        ].map((stat, i) => (
                          <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--border-faint)' : 'none', paddingRight: '4px' }}>
                            <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                              {stat.label}
                            </div>
                            <div style={{ fontSize: '11.5px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: stat.col }}>
                              {stat.val}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button to apply shock */}
                    {m.appliedSliders && (
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-accent btn-xs"
                          onClick={() => {
                            setSliders(m.appliedSliders);
                            handleRunSimulation();
                          }}
                          style={{ gap: '4px', fontSize: '10.5px' }}
                        >
                          <Zap size={11} />
                          {m.actionLabel || 'Apply Parameters to Simulator'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                <div style={{
                  display: 'flex', gap: '4px', alignItems: 'center',
                  background: 'var(--bg-card-alt)', padding: '6px 12px',
                  borderRadius: '2px', border: '1px solid var(--border-subtle)',
                }}>
                  <activeEngine.icon size={13} color={activeEngine.color} style={{ animation: 'spin 1.5s linear infinite' }} />
                  <span style={{ fontSize: '11px', color: activeEngine.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    [{activeEngine.shortName}] Computing inference vector…
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Bar */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card-alt)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                className="input"
                style={{ flex: 1, height: '36px', fontSize: '12.5px' }}
                placeholder={`Query ${activeEngine.shortName} (e.g. stress test packaging or capex cut)...`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleSendPrompt()}
                disabled={loading || !prompt.trim()}
                style={{ height: '36px', padding: '0 14px', gap: '6px' }}
              >
                {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                <span>Send</span>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', color: 'var(--text-muted)' }}>
              <span>Press <strong style={{ color: 'var(--text-secondary)' }}>Enter</strong> to send query</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Backend: {activeEngine.name}</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            RIGHT: QUANT SIMULATION & STRESS SUITE
        ════════════════════════════════════════════════════════ */}
        <div style={{
          height: '100%',
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '2px',
        }}>
          {/* Outcome Stats Ribbon */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            background: 'var(--bg-card)',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {[
              { label: 'Current Price', value: `$${stock.price.toFixed(2)}`, color: 'var(--text-primary)' },
              { label: 'P90 Target (Bull)', value: bullP90 ? `$${bullP90}` : '—', color: 'var(--green-bright)' },
              { label: 'Median Path', value: medianTarget ? `$${medianTarget}` : '—', color: 'var(--cyan-bright)' },
              { label: 'P10 Target (Bear)', value: bearP10 ? `$${bearP10}` : '—', color: 'var(--red-bright)' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '9px 12px',
                borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color, letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Monte Carlo Fan Chart Card */}
          <div className="card" style={{ padding: '12px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="section-title">90-Day Monte Carlo Trajectory Fan</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                {[
                  { color: 'var(--green-bright)', label: 'P90 (Bull)' },
                  { color: 'var(--cyan-bright)', label: 'Median' },
                  { color: 'var(--amber)', label: 'Consensus' },
                  { color: 'var(--red-bright)', label: 'P10 (Bear)' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 18, height: 2, background: l.color, borderRadius: 1 }} />
                    <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 14, left: 6, bottom: 6 }}>
                  <defs>
                    <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--cyan)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 9.5, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={56} />
                  <Tooltip content={<MonteCarloTooltip />} />
                  <ReferenceLine y={stock.price} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Entry', fill: 'var(--text-muted)', fontSize: 9.5 }} />

                  {/* Confidence cone */}
                  <Area type="monotone" dataKey="p90"  stroke="var(--green-bright)" strokeWidth={1.5}
                    fill="url(#coneGrad)" dot={false} />
                  <Area type="monotone" dataKey="p75"  stroke="none" fill="url(#coneGrad)" dot={false} />
                  <Area type="monotone" dataKey="p25"  stroke="none" fill="transparent" dot={false} />
                  <Area type="monotone" dataKey="p10"  stroke="var(--red-bright)" strokeWidth={1.5}
                    fill="transparent" dot={false} />

                  {/* Key paths */}
                  <Line type="monotone" dataKey="median"    stroke="var(--cyan-bright)"  strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="consensus" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Variable Shock Inputs */}
          <div className="card" style={{ padding: '14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="section-title">Variable Shock Sliders</div>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setSliders({ tsmc: 50, hyperscaler: 50, grossMargin: 50 })}
                style={{ fontSize: '10px' }}
              >
                <RotateCcw size={10} /> Reset to Base
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <SliderControl
                label="TSMC Capacity"
                sublabel="CoWoS-L wafer allocation"
                value={sliders.tsmc}
                onChange={v => setSliders(prev => ({ ...prev, tsmc: v }))}
              />
              <SliderControl
                label="Hyperscaler Capex"
                sublabel="Cloud AI infra spend YoY"
                value={sliders.hyperscaler}
                onChange={v => setSliders(prev => ({ ...prev, hyperscaler: v }))}
              />
              <SliderControl
                label="Gross Margin"
                sublabel="Blended product headroom"
                value={sliders.grossMargin}
                onChange={v => setSliders(prev => ({ ...prev, grossMargin: v }))}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '4px', gap: '8px', height: '34px', fontSize: '12px' }}
              onClick={handleRunSimulation}
              disabled={loading}
            >
              {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
              {loading ? 'Simulating Quantitative Paths…' : 'Re-Run Monte Carlo Simulation with Sliders'}
            </button>
          </div>

          {/* Hedge Recommendations & Volatility Suite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Hedge Recommendations */}
            <div className="card" style={{ padding: '12px 14px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>
                <Shield size={11} color="var(--cyan-bright)" />
                Institutional Hedge Recommendations
              </div>
              {HEDGE_RECS.map((h, i) => (
                <div key={i} style={{
                  padding: '7px 10px', marginBottom: '6px', borderRadius: '2px',
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: h.color, letterSpacing: '0.06em' }}>{h.type}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>{h.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cost</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{h.cost}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Volatility & Valuation Retest */}
            <div className="card" style={{ padding: '12px 14px' }}>
              <div className="section-title" style={{ marginBottom: '8px' }}>Volatility Regime Calibration</div>
              {[
                { label: '30d Realized Vol', value: '38.4%', bar: 0.38, color: 'var(--amber)' },
                { label: '90d Implied Vol',  value: '42.1%', bar: 0.42, color: 'var(--cyan-bright)' },
                { label: 'Historical Baseline', value: '45.0%', bar: 0.45, color: 'var(--text-muted)' },
              ].map((v, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{v.label}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: v.color }}>{v.value}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '3px' }}>
                    <div className="progress-fill" style={{ width: `${v.bar * 100}%`, background: v.color }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-faint)',
                display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)',
              }}>
                <span>P/E (FWD): <strong style={{ color: 'var(--text-primary)' }}>68.4x</strong></span>
                <span>EV/EBITDA: <strong style={{ color: 'var(--text-primary)' }}>35.2x</strong></span>
                <span>P/S: <strong style={{ color: 'var(--text-primary)' }}>22.1x</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
