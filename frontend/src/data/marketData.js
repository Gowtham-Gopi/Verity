// Central data store for Verity Intelligence Terminal
// In production this would be replaced by live WebSocket / REST feeds

export const MARKET_INDICES = [
  { symbol: 'SPY',   label: 'S&P 500',  price: 584.72,  change: 2.34,  changePct: 0.40,  type: 'equity' },
  { symbol: 'QQQ',   label: 'NASDAQ',   price: 501.18,  change: 3.91,  changePct: 0.79,  type: 'equity' },
  { symbol: 'VIX',   label: 'VIX',      price: 13.42,   change: -0.88, changePct: -6.15, type: 'volatility' },
  { symbol: 'US10Y', label: '10Y YIELD',price: 4.312,   change: 0.028, changePct: 0.65,  type: 'rate' },
  { symbol: 'DXY',   label: 'DXY',      price: 103.84,  change: -0.21, changePct: -0.20, type: 'fx' },
  { symbol: 'GOLD',  label: 'GOLD',     price: 2641.50, change: 12.30, changePct: 0.47,  type: 'commodity' },
];

export const WATCHLIST = [
  {
    id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Semis',
    price: 875.40, change: 24.15, changePct: 2.84,
    volume: '48.2M', mktCap: '2.15T', pe: 68.4,
    tags: ['Supply', 'Product', 'Analyst'],
    catalysts: 3, alertLevel: 'high',
    sparkData: [820, 838, 831, 845, 852, 848, 861, 858, 869, 875],
  },
  {
    id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Cloud',
    price: 432.18, change: 5.62, changePct: 1.32,
    volume: '22.1M', mktCap: '3.21T', pe: 36.8,
    tags: ['Product', 'Earnings'],
    catalysts: 2, alertLevel: 'medium',
    sparkData: [420, 423, 419, 425, 428, 424, 429, 430, 431, 432],
  },
  {
    id: 'TSMC', symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semis',
    price: 195.62, change: -3.41, changePct: -1.71,
    volume: '15.7M', mktCap: '1.01T', pe: 29.2,
    tags: ['Supply', 'Macro', 'Legal'],
    catalysts: 4, alertLevel: 'high',
    sparkData: [202, 200, 198, 201, 197, 195, 194, 196, 196, 195],
  },
  {
    id: 'META', symbol: 'META', name: 'Meta Platforms', sector: 'Advertising',
    price: 582.34, change: 8.91, changePct: 1.55,
    volume: '18.3M', mktCap: '1.48T', pe: 27.1,
    tags: ['Product', 'Analyst'],
    catalysts: 1, alertLevel: 'low',
    sparkData: [568, 570, 572, 569, 575, 578, 576, 579, 581, 582],
  },
  {
    id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Cloud',
    price: 183.45, change: -2.12, changePct: -1.14,
    volume: '24.5M', mktCap: '2.28T', pe: 22.3,
    tags: ['Legal', 'Product'],
    catalysts: 2, alertLevel: 'medium',
    sparkData: [188, 186, 187, 185, 184, 183, 182, 183, 184, 183],
  },
  {
    id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'Cloud',
    price: 214.78, change: 3.45, changePct: 1.63,
    volume: '31.2M', mktCap: '2.26T', pe: 44.6,
    tags: ['Earnings', 'Macro'],
    catalysts: 2, alertLevel: 'medium',
    sparkData: [208, 210, 209, 211, 212, 211, 213, 214, 214, 214],
  },
];

export const CATALYST_FEED = [
  {
    id: 1, ticker: 'NVDA', time: '14:32', tag: 'Supply',
    headline: 'TSMC confirms CoWoS-L packaging expanded to 30k wafers/month — 3 months ahead of schedule',
    impact: 'HIGH', confidence: 92, direction: 'bullish',
    priceMove: '+2.4%', summary: 'Supply constraint relief directly addresses NVDA\'s H100/H200 production bottleneck.',
  },
  {
    id: 2, ticker: 'NVDA', time: '13:15', tag: 'Analyst',
    headline: 'Morgan Stanley raises NVDA PT to $1,100 on data center TAM expansion thesis',
    impact: 'HIGH', confidence: 88, direction: 'bullish',
    priceMove: '+1.1%', summary: 'Upgrades driven by hyperscaler capex acceleration signals demand floor.',
  },
  {
    id: 3, ticker: 'TSM', time: '12:44', tag: 'Legal',
    headline: 'US Commerce Dept confirms TSMC AZ fab eligible for $6.6B CHIPS Act grant disbursement',
    impact: 'MED', confidence: 79, direction: 'bullish',
    priceMove: '+0.8%', summary: 'Resolves months of uncertainty, accelerates domestic supply chain build-out.',
  },
  {
    id: 4, ticker: 'GOOGL', time: '11:20', tag: 'Legal',
    headline: 'DOJ antitrust brief seeks forced sale of Chrome browser — widens breakup scope',
    impact: 'HIGH', confidence: 84, direction: 'bearish',
    priceMove: '-2.3%', summary: 'Structural risk to advertising moat if search distribution channels disrupted.',
  },
  {
    id: 5, ticker: 'MSFT', time: '10:05', tag: 'Product',
    headline: 'Azure OpenAI throughput quotas doubled for enterprise — signals GPT-5 infra readiness',
    impact: 'MED', confidence: 74, direction: 'bullish',
    priceMove: '+0.9%', summary: 'AI monetization velocity accelerating ahead of Azure Next earnings call.',
  },
];

export const NVDA_INTRADAY = [
  { time: '09:30', price: 848.20, vol: 4200000 },
  { time: '09:45', price: 851.40, vol: 3800000 },
  { time: '10:00', price: 849.80, vol: 2900000 },
  { time: '10:15', price: 853.20, vol: 3200000 },
  { time: '10:30', price: 858.90, vol: 5100000 },  // catalyst 1
  { time: '10:45', price: 862.40, vol: 4600000 },
  { time: '11:00', price: 860.10, vol: 2800000 },
  { time: '11:15', price: 857.30, vol: 2400000 },
  { time: '11:30', price: 859.60, vol: 2100000 },
  { time: '11:45', price: 861.80, vol: 1900000 },
  { time: '12:00', price: 863.20, vol: 1600000 },
  { time: '12:15', price: 864.40, vol: 1700000 },  // catalyst 2
  { time: '12:30', price: 867.90, vol: 3100000 },
  { time: '12:45', price: 865.20, vol: 2200000 },
  { time: '13:00', price: 866.50, vol: 2000000 },
  { time: '13:15', price: 869.10, vol: 2600000 },  // catalyst 3
  { time: '13:30', price: 871.40, vol: 3400000 },
  { time: '13:45', price: 870.20, vol: 2300000 },
  { time: '14:00', price: 872.80, vol: 2100000 },
  { time: '14:15', price: 874.10, vol: 2400000 },
  { time: '14:30', price: 875.40, vol: 4800000 },
];

export const CATALYST_NODES = [
  {
    id: 1, time: '10:30', timeLabel: '10:30 AM', price: 858.90,
    tag: 'Supply', headline: 'TSMC CoWoS-L Capacity Expansion',
    move: '+2.4%', direction: 'bullish',
    narrative: {
      title: 'Why It Moved — Supply Chain Relief',
      summary: 'TSMC\'s confirmed ramp of CoWoS-L advanced packaging to 30k wafers/month directly resolves NVIDIA\'s most critical H100/H200 supply bottleneck, unlocking ~$2B in deferred revenue.',
      factors: [
        { label: 'Supply Chain',  detail: 'CoWoS-L capacity +40% QoQ; eliminates 6-week lead time premium', impact: '+' },
        { label: 'Revenue Impact', detail: 'H200 allocation now covers 94% of hyperscaler backlog', impact: '+' },
        { label: 'Dark Pool Flow', detail: '$480M block trade confirmed at $857 strike (institutional accumulation)', impact: '+' },
        { label: 'Volatility',    detail: 'IV crush post-event; 30d IV drops from 58% → 44%', impact: '~' },
      ],
    },
  },
  {
    id: 2, time: '12:15', timeLabel: '12:15 PM', price: 864.40,
    tag: 'Analyst', headline: 'Morgan Stanley $1,100 PT Raise',
    move: '+1.1%', direction: 'bullish',
    narrative: {
      title: 'Why It Moved — Analyst Catalyst',
      summary: 'MS conviction upgrade driven by revised data center TAM model now projecting $500B by 2027. GPU compute unit economics now underpin a new valuation framework at 35x FY26 EV/EBITDA.',
      factors: [
        { label: 'PT Revision',     detail: '$950 → $1,100 (+15.8%); Highest on Street', impact: '+' },
        { label: 'TAM Expansion',   detail: 'DC GPU TAM revised +22% on AI inference demand surge', impact: '+' },
        { label: 'Institutional',   detail: '14 funds added positions within 4h of note publication', impact: '+' },
        { label: 'Options Flow',    detail: '$1,050 call sweep: 8,400 contracts @ $3.2M premium', impact: '+' },
      ],
    },
  },
  {
    id: 3, time: '13:15', timeLabel: '01:15 PM', price: 869.10,
    tag: 'Product', headline: 'Blackwell B200 Tape-Out Confirmed',
    move: '+0.8%', direction: 'bullish',
    narrative: {
      title: 'Why It Moved — Product Roadmap',
      summary: 'Internal NVIDIA roadmap leak subsequently confirmed by supply chain checks shows B200 NVL72 tape-out completed. Expected ramp Q1\'25 positions NVIDIA 18 months ahead of AMD MI400 cadence.',
      factors: [
        { label: 'Roadmap',       detail: 'B200 NVL72 tape-out confirmed; revenue ramp Q1 2025', impact: '+' },
        { label: 'Competitive',   detail: 'AMD MI400 delayed to H2\'25; NVDA gap widens to 18mo', impact: '+' },
        { label: 'Margin Proxy',  detail: 'NVL72 ASP estimated $8M/rack → blended GM +4pp headroom', impact: '+' },
        { label: 'Risk',          detail: 'US-China export restrictions may limit TAM by ~12%', impact: '-' },
      ],
    },
  },
];

export const MACRO_SECTORS = [
  {
    id: 'tech', label: 'Tech / Semis', beta: 1.42, exposure: 'HIGH',
    narrative: 'AI capex supercycle + CoWoS supply unlock driving re-rating. Blackwell ramp cadence is the dominant catalyst through Q1 2025.',
    topHoldings: ['NVDA', 'TSM', 'AMAT', 'KLAC'],
    momentum: 78, trend: 'bullish',
    weeklyReturn: 3.2,
  },
  {
    id: 'fin', label: 'Financials', beta: 0.98, exposure: 'MED',
    narrative: 'Fed rate trajectory ambiguity creating NIM compression risk. Inverted yield curve impact on bank book values remains headwind.',
    topHoldings: ['JPM', 'GS', 'BAC', 'MS'],
    momentum: 45, trend: 'neutral',
    weeklyReturn: 0.4,
  },
  {
    id: 'health', label: 'Healthcare', beta: 0.61, exposure: 'LOW',
    narrative: 'GLP-1 drug demand secular tailwind. Medicare negotiation impact to biopharmaceutical pricing creates headline risk through Q4.',
    topHoldings: ['LLY', 'JNJ', 'ABBV', 'UNH'],
    momentum: 52, trend: 'neutral',
    weeklyReturn: 1.1,
  },
  {
    id: 'energy', label: 'Energy', beta: 0.84, exposure: 'MED',
    narrative: 'OPEC+ supply discipline holding oil in $78-88 range. AI datacenter power demand creating structural electricity consumption catalyst for utilities cross-sector.',
    topHoldings: ['XOM', 'CVX', 'SLB', 'EOG'],
    momentum: 61, trend: 'neutral',
    weeklyReturn: -0.8,
  },
];

export const UPCOMING_EVENTS = [
  { id: 1, date: 'Oct 24',  time: '08:30',  event: 'US CPI MoM',         type: 'macro',    impact: 'EXTREME', symbol: 'SPY' },
  { id: 2, date: 'Oct 29',  time: '14:00',  event: 'FOMC Rate Decision',  type: 'macro',    impact: 'EXTREME', symbol: 'SPY' },
  { id: 3, date: 'Oct 30',  time: 'AH',     event: 'NVDA Earnings Q3',   type: 'earnings', impact: 'HIGH',    symbol: 'NVDA' },
  { id: 4, date: 'Oct 31',  time: 'AH',     event: 'META Earnings Q3',   type: 'earnings', impact: 'HIGH',    symbol: 'META' },
  { id: 5, date: 'Nov 1',   time: 'BH',     event: 'AMZN Earnings Q3',   type: 'earnings', impact: 'HIGH',    symbol: 'AMZN' },
  { id: 6, date: 'Nov 5',   time: '09:00',  event: 'US NFP Payrolls',    type: 'macro',    impact: 'HIGH',    symbol: 'SPY' },
  { id: 7, date: 'Nov 7',   time: '10:00',  event: 'MSFT Earnings Q1',   type: 'earnings', impact: 'HIGH',    symbol: 'MSFT' },
];

// Generate Monte Carlo paths
export function generateMonteCarloPaths(basePrice, days = 90, numPaths = 6, sliderValues = {}) {
  const { tsmc = 50, hyperscaler = 50, grossMargin = 50 } = sliderValues;

  // Map sliders to drift/vol adjustments
  const driftAdj = ((tsmc - 50) * 0.003 + (hyperscaler - 50) * 0.002 + (grossMargin - 50) * 0.001) / 100;
  const volAdj = 1 + (Math.abs(tsmc - 50) + Math.abs(hyperscaler - 50)) * 0.003;

  const baseDrift = 0.0008 + driftAdj;
  const baseVol   = 0.022  * volAdj;

  const paths = [];

  for (let p = 0; p < numPaths; p++) {
    const path = [basePrice];
    const pathDrift = baseDrift + (Math.random() - 0.5) * 0.0006;
    const pathVol   = baseVol   + (Math.random() - 0.5) * 0.004;

    for (let d = 1; d <= days; d++) {
      const rand = boxMullerRandom();
      const prev = path[d - 1];
      const ret  = pathDrift + pathVol * rand;
      path.push(+(prev * Math.exp(ret)).toFixed(2));
    }
    paths.push(path);
  }

  // Consensus path (steady drift)
  const consensusPath = [basePrice];
  for (let d = 1; d <= days; d++) {
    consensusPath.push(+(consensusPath[d - 1] * Math.exp(0.0006)).toFixed(2));
  }

  return { paths, consensusPath };
}

function boxMullerRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function buildMonteCarloChartData(basePrice, days = 90, sliderValues = {}) {
  const { paths, consensusPath } = generateMonteCarloPaths(basePrice, days, 6, sliderValues);

  const data = [];
  for (let d = 0; d <= days; d++) {
    const allValues = paths.map(p => p[d]);
    const entry = {
      day: d,
      label: d === 0 ? 'Now' : `D+${d}`,
      consensus: consensusPath[d],
      median: paths[2][d],
      p10: Math.min(...allValues),
      p90: Math.max(...allValues),
      p25: allValues.sort((a, b) => a - b)[1],
      p75: allValues.sort((a, b) => a - b)[4],
    };
    paths.forEach((p, i) => { entry[`path${i}`] = p[d]; });
    data.push(entry);
  }
  return data;
}
