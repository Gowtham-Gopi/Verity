import { useState, useCallback, useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Cpu, Send, Loader, Zap, Shield, RotateCcw } from 'lucide-react';
import { buildMonteCarloChartData, WATCHLIST } from '../data/marketData';
import { useVerity } from '../context/VerityContext';

const SCENARIO_PRESETS = [
  { label: 'Bull Case: Supply Unlock + Capex Surge', tsmc: 85, hyperscaler: 80, grossMargin: 70 },
  { label: 'Bear Case: Geopolitical Disruption',     tsmc: 20, hyperscaler: 30, grossMargin: 35 },
  { label: 'Base Case: Consensus Trajectory',         tsmc: 50, hyperscaler: 50, grossMargin: 50 },
  { label: 'Squeeze: Margin Expansion, Supply Flat',  tsmc: 50, hyperscaler: 55, grossMargin: 80 },
];

const HEDGE_RECS = [
  { type: 'PUT SPREAD', detail: '$800/$750 Put Spread — Nov Exp', cost: '$4.20/share', color: 'var(--red)' },
  { type: 'COLLAR',     detail: 'Long $850P / Short $950C — Dec Exp', cost: '$1.80/share', color: 'var(--amber)' },
  { type: 'VIX CALL',   detail: 'VIX $20 Call — protects systemic selloff', cost: '$0.95/share', color: 'var(--purple)' },
];

const AI_RESPONSES = [
  "Based on the current TSMC packaging capacity normalization (+{tsmc}% scenario shock), I'm projecting a {priceTarget} price target for NVDA over the 90-day window with a {confidence}% confidence interval. The primary driver is H200 supply unlocking ~$2.1B in deferred revenue at 74% gross margin.",
  "Running Monte Carlo simulation across 500 paths... The median outcome suggests NVDA trades to ${median} with the bull/bear spread at ${spread}. Key risk: US-China export controls could shave 8–12% from the TAM. My recommendation is to size the position at 65% of target weight until the October FOMC clarifies rate trajectory.",
  "The hyperscaler capex delta of {hyperscaler}% above baseline is a material positive. Microsoft, Google, and Amazon have collectively committed $85B in AI infrastructure for FY2025. At current ASPs, NVDA captures ~38% of incremental spend. This scenario supports a 3.2x earnings revision cycle.",
];

function SliderControl({ label, sublabel, value, onChange, unit = '%', min = 0, max = 100 }) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = pct > 60 ? 'var(--green)' : pct < 40 ? 'var(--red)' : 'var(--cyan)';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{sublabel}</div>
        </div>
        <div style={{
          minWidth: '52px', textAlign: 'right',
          fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color,
          transition: 'color 0.3s ease',
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
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Bearish</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Base</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Bullish</span>
      </div>
    </div>
  );
}

function MonteCarloTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload.reduce((acc, item) => { acc[item.dataKey] = item.value; return acc; }, {});
  return (
    <div style={{
      background: 'var(--bg-card-elevated)',
      border: '1px solid var(--border-strong)',
      borderRadius: '8px', padding: '10px 12px', fontSize: '11px',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>{label}</div>
      {p.consensus && <div style={{ color: 'var(--amber)', marginBottom: '2px' }}>Consensus: <strong>${p.consensus?.toFixed(0)}</strong></div>}
      {p.p90 && <div style={{ color: 'var(--green)', marginBottom: '2px' }}>P90: <strong>${p.p90?.toFixed(0)}</strong></div>}
      {p.median && <div style={{ color: 'var(--cyan)', marginBottom: '2px' }}>Median: <strong>${p.median?.toFixed(0)}</strong></div>}
      {p.p10 && <div style={{ color: 'var(--red)' }}>P10: <strong>${p.p10?.toFixed(0)}</strong></div>}
    </div>
  );
}

export default function WhatIf() {
  const { activeTicker } = useVerity();
  const stock = WATCHLIST.find(w => w.id === activeTicker) || WATCHLIST[0];

  const [sliders, setSliders] = useState({ tsmc: 50, hyperscaler: 50, grossMargin: 50 });
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Welcome to the AI Copilot. I'm initialized with ${stock.symbol} context. Adjust the scenario sliders or ask me any quantitative what-if question — I'll run Monte Carlo simulations and provide hedge recommendations.` },
  ]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const chartData = useMemo(() => {
    // Sample every 3 days to keep chart readable
    const raw = buildMonteCarloChartData(stock.price, 90, sliders);
    return raw.filter((_, i) => i % 3 === 0 || i === 0 || i === 90);
  }, [sliders, stock.price]);

  const handleRun = useCallback(() => {
    setLoading(true);
    setRan(false);
    setTimeout(() => {
      const baseRes = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const last = chartData[chartData.length - 1];
      const response = baseRes
        .replace('{tsmc}', sliders.tsmc)
        .replace('{hyperscaler}', sliders.hyperscaler)
        .replace('{priceTarget}', `$${((sliders.tsmc / 50) * stock.price * 1.08).toFixed(0)}`)
        .replace('{confidence}', (65 + sliders.grossMargin * 0.3).toFixed(0))
        .replace('{median}', last?.median?.toFixed(0) || 900)
        .replace('{spread}', ((last?.p90 || 950) - (last?.p10 || 750)).toFixed(0));
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setLoading(false);
      setRan(true);
    }, 1800);
  }, [sliders, stock, chartData]);

  const handleSend = useCallback(() => {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setPrompt('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Analyzing "${prompt}" for ${stock.symbol}... Based on current slider configuration (TSMC: ${sliders.tsmc}%, Capex Delta: ${sliders.hyperscaler}%, GM: ${sliders.grossMargin}%), the scenario suggests a ${sliders.tsmc > 50 ? 'constructive' : 'cautious'} outlook with key support at $${(stock.price * 0.92).toFixed(0)} and resistance at $${(stock.price * 1.14).toFixed(0)}.`,
      }]);
      setLoading(false);
    }, 1200);
  }, [prompt, sliders, stock]);

  const applyPreset = (preset) => {
    setSliders({ tsmc: preset.tsmc, hyperscaler: preset.hyperscaler, grossMargin: preset.grossMargin });
  };

  const bullP10 = chartData[chartData.length - 1]?.p90?.toFixed(0);
  const bearP90 = chartData[chartData.length - 1]?.p10?.toFixed(0);
  const medianTarget = chartData[chartData.length - 1]?.median?.toFixed(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            AI Copilot & What-If Studio
          </h1>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulating 90-day Monte Carlo paths for <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{stock.symbol}</span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          background: 'var(--bg-card-alt)',
          overflow: 'hidden',
        }}>
          {SCENARIO_PRESETS.map((p, i) => (
            <button key={i} className="btn btn-ghost btn-sm" onClick={() => applyPreset(p)}
              style={{
                fontSize: '10.5px',
                borderRadius: 0,
                border: 'none',
                borderRight: i < SCENARIO_PRESETS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                padding: '6px 12px',
              }}>
              {p.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '8px' }}>

        {/* LEFT: Controls + Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Shock Sliders */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="section-title">Variable Shock Inputs</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSliders({ tsmc: 50, hyperscaler: 50, grossMargin: 50 })}>
                <RotateCcw size={10} />
                Reset
              </button>
            </div>
            <SliderControl
              label="TSMC Packaging Capacity"
              sublabel="CoWoS-L wafer allocation delta"
              value={sliders.tsmc}
              onChange={v => setSliders(prev => ({ ...prev, tsmc: v }))}
            />
            <SliderControl
              label="Hyperscaler Capex Delta"
              sublabel="Cloud provider AI infra spend YoY"
              value={sliders.hyperscaler}
              onChange={v => setSliders(prev => ({ ...prev, hyperscaler: v }))}
            />
            <SliderControl
              label="Gross Margin (bps)"
              sublabel="Blended product mix GM headroom"
              value={sliders.grossMargin}
              onChange={v => setSliders(prev => ({ ...prev, grossMargin: v }))}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '4px', gap: '8px', height: '36px' }}
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
              {loading ? 'Simulating…' : 'Run Scenario'}
            </button>
          </div>

          {/* Hedge Recommendations */}
          {ran && (
            <div className="card" style={{ padding: '14px', animation: 'fadeIn 0.3s ease' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <Shield size={11} />
                Hedge Recommendations
              </div>
              {HEDGE_RECS.map((h, i) => (
                <div key={i} style={{
                  padding: '9px 12px', marginBottom: '6px', borderRadius: '2px',
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: h.color, letterSpacing: '0.06em' }}>{h.type}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cost</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{h.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Chat */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '220px', overflow: 'hidden' }}>
            <div className="section-header" style={{ flexShrink: 0 }}>
              <div className="section-title">
                <Cpu size={11} color="var(--cyan)" />
                AI Natural Language Prompt
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '88%', padding: '8px 12px', borderRadius: '6px',
                    fontSize: '11.5px', lineHeight: 1.55,
                    background: m.role === 'user' ? 'var(--cyan-dark)' : 'var(--bg-card-elevated)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(255,255,255,0.12)' : 'var(--border-subtle)'}`,
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '4px', padding: '8px 12px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--cyan-bright)',
                      animation: `pulse-dot 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{
              padding: '10px', borderTop: '1px solid var(--border-subtle)',
              display: 'flex', gap: '8px', flexShrink: 0,
            }}>
              <input
                className="input"
                style={{ flex: 1, height: '34px', fontSize: '11px' }}
                placeholder="Ask anything about this scenario…"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={loading || !prompt.trim()}>
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Monte Carlo Chart + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Outcome Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            background: 'var(--bg-card)',
            overflow: 'hidden',
          }}>
            {[
              { label: 'Current Price', value: `$${stock.price.toFixed(2)}`, color: 'var(--text-primary)' },
              { label: 'P90 Target (Bull)', value: bullP10 ? `$${bullP10}` : '—', color: 'var(--green-bright)' },
              { label: 'Median Target', value: medianTarget ? `$${medianTarget}` : '—', color: 'var(--cyan-bright)' },
              { label: 'P10 Target (Bear)', value: bearP90 ? `$${bearP90}` : '—', color: 'var(--red-bright)' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color, letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Monte Carlo Fan Chart */}
          <div className="card" style={{ flex: 1, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="section-title">90-Day Monte Carlo Trajectory Fan</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                {[
                  { color: 'var(--green)', label: 'P90 (Bull)' },
                  { color: 'var(--cyan)', label: 'Median' },
                  { color: 'var(--amber)', label: 'Consensus' },
                  { color: 'var(--red)', label: 'P10 (Bear)' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 24, height: 2, background: l.color, borderRadius: 2 }} />
                    <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--cyan)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={60} />
                <Tooltip content={<MonteCarloTooltip />} />
                <ReferenceLine y={stock.price} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Entry', fill: 'var(--text-muted)', fontSize: 10 }} />

                {/* Confidence cone */}
                <Area type="monotone" dataKey="p90"  stroke="var(--green)" strokeWidth={1.5}
                  fill="url(#coneGrad)" dot={false} />
                <Area type="monotone" dataKey="p75"  stroke="none" fill="url(#coneGrad)" dot={false} />
                <Area type="monotone" dataKey="p25"  stroke="none" fill="transparent" dot={false} />
                <Area type="monotone" dataKey="p10"  stroke="var(--red)" strokeWidth={1.5}
                  fill="transparent" dot={false} />

                {/* Key paths */}
                <Line type="monotone" dataKey="median"    stroke="var(--cyan)"  strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="consensus" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volatility + Valuation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="card" style={{ padding: '14px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>Volatility Projection</div>
              {[
                { label: '30d Realized Vol', value: '38.4%', bar: 0.38, color: 'var(--amber)' },
                { label: '90d Implied Vol',  value: '42.1%', bar: 0.42, color: 'var(--cyan)' },
                { label: 'Historical Vol',   value: '45.0%', bar: 0.45, color: 'var(--text-muted)' },
              ].map((v, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{v.label}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: v.color }}>{v.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${v.bar * 100}%`, background: v.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>Valuation Retest</div>
              {[
                { label: 'P/E (FWD)',   current: '68.4x', stress: '52.1x', bull: '84.0x' },
                { label: 'EV/EBITDA',  current: '35.2x', stress: '26.8x', bull: '44.5x' },
                { label: 'P/S',        current: '22.1x', stress: '17.4x', bull: '27.9x' },
              ].map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', width: '60px' }}>{v.label}</span>
                  <span style={{ color: 'var(--red)',  width: '40px', fontFamily: 'var(--font-mono)' }}>{v.stress}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, width: '40px', fontFamily: 'var(--font-mono)' }}>{v.current}</span>
                  <span style={{ color: 'var(--green)', width: '40px', fontFamily: 'var(--font-mono)' }}>{v.bull}</span>
                </div>
              ))}
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Bear / Current / Bull</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
