import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Zap, AlertTriangle } from 'lucide-react';
import { MACRO_SECTORS, UPCOMING_EVENTS } from '../data/marketData';

// ── Sector Quadrant Card ──────────────────────────────────────────────────────
function SectorCard({ sector }) {
  const trendBorder = {
    bullish: 'var(--green-bright)',
    neutral: 'var(--amber)',
    bearish: 'var(--red-bright)',
  }[sector.trend] || 'var(--border-subtle)';

  const exposureColors = {
    HIGH: 'var(--red-bright)', MED: 'var(--amber)', LOW: 'var(--green-bright)',
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderLeft: `3px solid ${trendBorder}`,
      borderRadius: '2px',
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {sector.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>β {sector.beta}</span>
            <span style={{
              fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.06em',
              padding: '1px 5px', borderRadius: '2px',
              background: `${exposureColors[sector.exposure]}15`,
              color: exposureColors[sector.exposure],
              border: `1px solid ${exposureColors[sector.exposure]}30`,
            }}>
              {sector.exposure} EXPOSURE
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '1px' }}>7d Return</div>
          <div style={{
            fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: sector.weeklyReturn >= 0 ? 'var(--green-bright)' : 'var(--red-bright)',
          }}>
            {sector.weeklyReturn >= 0 ? '+' : ''}{sector.weeklyReturn}%
          </div>
        </div>
      </div>

      {/* Narrative */}
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {sector.narrative}
      </p>

      {/* Momentum Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Momentum Score
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)' }}>
            {sector.momentum}/100
          </span>
        </div>
        <div className="progress-bar" style={{ height: '3px' }}>
          <div className="progress-fill" style={{
            width: `${sector.momentum}%`,
            background: sector.momentum > 65
              ? 'var(--green)'
              : sector.momentum > 45
              ? 'var(--cyan)'
              : 'var(--red)',
          }} />
        </div>
      </div>

      {/* Top Holdings */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {sector.topHoldings.map(h => (
          <span key={h} style={{
            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
            padding: '2px 6px', borderRadius: '2px',
            background: 'var(--bg-card-alt)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}>{h}</span>
        ))}
      </div>
    </div>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────────
function EventRow({ event, onSimulate }) {
  const impactColors = {
    EXTREME: { bg: 'rgba(244, 63, 94, 0.1)', color: 'var(--red-bright)', border: 'rgba(244, 63, 94, 0.25)' },
    HIGH:    { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber-bright)', border: 'rgba(245, 158, 11, 0.25)' },
    MED:     { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--cyan-bright)', border: 'rgba(59, 130, 246, 0.25)' },
  };
  const typeColors = {
    macro:    { bg: 'var(--purple-dim)', color: '#c084fc' },
    earnings: { bg: 'var(--cyan-dim)',   color: 'var(--cyan-bright)' },
  };
  const ic = impactColors[event.impact] || impactColors.MED;
  const tc = typeColors[event.type] || typeColors.macro;
  const [simmed, setSimmed] = useState(false);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '70px 70px 1fr 90px 90px 100px',
      alignItems: 'center', gap: '8px',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background 0.15s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
        {event.date}
      </span>
      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {event.time}
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {event.event}
      </span>
      <span style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
        padding: '2px 8px', borderRadius: '4px',
        background: tc.bg, color: tc.color,
        textTransform: 'capitalize',
      }}>{event.type}</span>
      <span style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
        padding: '2px 8px', borderRadius: '4px',
        background: ic.bg, color: ic.color, border: `1px solid ${ic.border}`,
      }}>{event.impact}</span>
      <button
        className={`btn btn-sm ${simmed ? 'btn-ghost' : 'btn-accent'}`}
        onClick={() => { setSimmed(true); onSimulate(event); }}
      >
        {simmed ? '✓ Simulated' : <><Zap size={10} />Simulate</>}
      </button>
    </div>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function MacroRadar() {
  const data = [
    { subject: 'Tech/Semis', A: 78, fullMark: 100 },
    { subject: 'Financials', A: 45, fullMark: 100 },
    { subject: 'Healthcare', A: 52, fullMark: 100 },
    { subject: 'Energy',     A: 61, fullMark: 100 },
    { subject: 'Commodities', A: 55, fullMark: 100 },
    { subject: 'FX/Rates',   A: 38, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis dataKey="subject"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }} />
        <Radar name="Momentum" dataKey="A" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.12} strokeWidth={1.5} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '11px' }}
          labelStyle={{ color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--cyan)' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Main Macro Page ───────────────────────────────────────────────────────────
export default function Macro() {
  const [simulatedEvent, setSimulatedEvent] = useState(null);

  const handleSimulate = (event) => {
    setSimulatedEvent(event);
    setTimeout(() => setSimulatedEvent(null), 4000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100%',
      padding: '8px 10px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      overflowX: 'hidden',
      animation: 'fadeIn 0.25s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Macro Drivers & Catalyst Radar</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-asset sector exposure matrix with impending volatility event tracker
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LIVE TICK SYNC</span>
        </div>
      </div>

      {/* Simulated Event Banner */}
      {simulatedEvent && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '2px',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeIn 0.25s ease',
        }}>
          <Zap size={14} color="var(--amber)" />
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--amber)' }}>Impact Simulation: </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {simulatedEvent.event} — Projected ±2.8% SPY move, VIX spike to 18.4, sector rotation into defensive positions expected.
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '8px' }}>
        {/* LEFT: Sector Matrix + Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* 4-Quadrant Sector Grid */}
          <div>
            <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Sector Exposure Matrix
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {MACRO_SECTORS.map(sector => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          </div>

          {/* Events Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <div className="section-title">
                <Calendar size={11} />
                High-Volatility Event Timetable
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{UPCOMING_EVENTS.length} events tracked</span>
            </div>
            {/* Column Headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '70px 70px 1fr 90px 90px 100px',
              padding: '6px 16px', borderBottom: '1px solid var(--border-subtle)', gap: '8px',
            }}>
              {['DATE', 'TIME', 'EVENT', 'TYPE', 'IMPACT', 'ACTION'].map(h => (
                <span key={h} style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {h}
                </span>
              ))}
            </div>
            {UPCOMING_EVENTS.map(event => (
              <EventRow key={event.id} event={event} onSimulate={handleSimulate} />
            ))}
          </div>
        </div>

        {/* RIGHT: Radar + Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Catalyst Radar</div>
            <MacroRadar />
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
              Momentum score by sector (0–100)
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Macro Pulse</div>
            {[
              { label: 'Risk-On Bias',      value: 'Strong',  color: 'var(--green)',  icon: '▲' },
              { label: 'Sector Rotation',   value: 'Tech → Fin', color: 'var(--amber)', icon: '⇌' },
              { label: 'Vol Regime',        value: 'Low-Vol', color: 'var(--green)',  icon: '▼' },
              { label: 'Liquidity',         value: 'Ample',   color: 'var(--cyan)',   icon: '●' },
              { label: 'Credit Spreads',    value: 'Tightening', color: 'var(--green)', icon: '▼' },
              { label: 'EM Risk',           value: 'Elevated', color: 'var(--amber)', icon: '▲' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>
                  {s.icon} {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Active Risks */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="section-title" style={{ marginBottom: '10px' }}>
              <AlertTriangle size={11} color="var(--red)" />
              Active Risk Flags
            </div>
            {[
              'US-China semiconductor export control escalation risk',
              'Fed Funds rate path uncertainty — Nov FOMC binary',
              'NVDA Q3 EPS beat/miss ±8% option-implied move',
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', padding: '7px 0',
                borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{
                  width: 4, borderRadius: '2px', flexShrink: 0,
                  background: i === 0 ? 'var(--red)' : i === 1 ? 'var(--amber)' : 'var(--cyan)',
                }} />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
