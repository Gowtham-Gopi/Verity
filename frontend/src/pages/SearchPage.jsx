import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Sparkles, ArrowRight, TrendingUp, Building2, Globe, Layers, CheckCircle2 } from 'lucide-react';
import { useVerity } from '../context/VerityContext';
import { fetchExchangeStocks } from '../services/exchangeApi';
import { WATCHLIST } from '../data/marketData';
import './SearchPage.css';

const EXCHANGE_FILTERS = [
  { id: 'ALL', label: 'All Exchanges' },
  { id: 'NSE', label: 'NSE / BSE (India)' },
  { id: 'US', label: 'NASDAQ / NYSE (US)' }
];

export default function SearchPage() {
  const { navigateTo, selectTicker } = useVerity();
  const [query, setQuery] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('ALL');
  const [allStocks, setAllStocks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const exchange = await fetchExchangeStocks();
        if (isMounted) {
          const combined = [...WATCHLIST, ...exchange];
          const unique = [];
          const seen = new Set();
          for (const item of combined) {
            const sym = item.symbol.toUpperCase();
            if (!seen.has(sym)) {
              seen.add(sym);
              unique.push(item);
            }
          }
          setAllStocks(unique);
        }
      } catch (e) {
        if (isMounted) setAllStocks(WATCHLIST);
      }
    }
    loadData();
    inputRef.current?.focus();
    return () => { isMounted = false; };
  }, []);

  // Filter dropdown options based on query and exchange selection
  const filteredOptions = useMemo(() => {
    let dataset = allStocks;
    if (exchangeFilter === 'NSE') {
      dataset = dataset.filter(s => (s.exchange || '').includes('NSE') || (s.exchange || '').includes('BSE'));
    } else if (exchangeFilter === 'US') {
      dataset = dataset.filter(s => !(s.exchange || '').includes('NSE') && !(s.exchange || '').includes('BSE'));
    }

    if (!query.trim()) {
      const popular = ['VBL', 'RELIANCE', 'TCS', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'HDFCBANK', 'AMZN', 'META'];
      return dataset.filter(s => popular.includes(s.symbol.toUpperCase())).slice(0, 8);
    }

    const q = query.trim().toLowerCase();
    const startsWithSymbol = [];
    const containsSymbol = [];
    const containsName = [];

    for (const stock of dataset) {
      const sym = stock.symbol.toLowerCase();
      const name = (stock.name || '').toLowerCase();

      if (sym === q) {
        startsWithSymbol.unshift(stock);
      } else if (sym.startsWith(q)) {
        startsWithSymbol.push(stock);
      } else if (sym.includes(q)) {
        containsSymbol.push(stock);
      } else if (name.includes(q)) {
        containsName.push(stock);
      }

      if (startsWithSymbol.length + containsSymbol.length + containsName.length >= 30) {
        break;
      }
    }

    return [...startsWithSymbol, ...containsSymbol, ...containsName].slice(0, 10);
  }, [query, allStocks, exchangeFilter]);

  const handleSelect = (stock) => {
    if (!stock) return;
    selectTicker(stock.id || stock.symbol);
    navigateTo('analysis', stock.id || stock.symbol);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[selectedIndex]) {
        handleSelect(filteredOptions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-page-container">
      <div className="search-page-inner">
        {/* Institutional Pill Tag */}
        <div className="search-badge">
          <Sparkles size={12} />
          <span>Verity Intelligence Terminal · Global & Domestic Equities</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="search-hero-title">
          Institutional Asset Search
        </h1>
        <p className="search-hero-desc">
          Query 12,000+ equities across the National Stock Exchange of India (NSE), BSE, NASDAQ, and NYSE. Select any stock to launch its real-time analytics deck.
        </p>

        {/* Search Bar Shell */}
        <div ref={dropdownRef} className="search-box-wrapper">
          <div className={`search-input-shell ${isOpen ? 'focused' : ''}`}>
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              ref={inputRef}
              type="text"
              className="search-field"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search ticker or company name (e.g. Varun Beverages, VBL, Reliance, NVDA, Apple)..."
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '6px 10px',
                  marginRight: '6px'
                }}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="search-submit-btn"
              onClick={() => {
                if (filteredOptions[selectedIndex]) {
                  handleSelect(filteredOptions[selectedIndex]);
                }
              }}
            >
              <span>Explore</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="search-dropdown-menu">
              <div className="search-dropdown-header">
                <span>{query.trim() ? `Search Results (${filteredOptions.length})` : 'Popular Exchange Assets'}</span>
                <span>↑ ↓ to navigate · Enter to select</span>
              </div>

              {filteredOptions.length > 0 ? (
                filteredOptions.map((stock, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isUp = stock.changePct >= 0;
                  const isNse = (stock.exchange || '').includes('NSE') || (stock.exchange || '').includes('BSE');
                  return (
                    <div
                      key={stock.id || stock.symbol}
                      className={`search-dropdown-item ${isSelected ? 'active' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(stock)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '12px' }}>
                        <div className="search-item-avatar">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '13.5px',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              color: '#ffffff'
                            }}>
                              {stock.symbol}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: isNse ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: isNse ? 'var(--amber-bright)' : 'var(--cyan-bright)',
                              border: `1px solid ${isNse ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                            }}>
                              {stock.exchange || 'BOARD'}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '1px',
                          }}>
                            {stock.name}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: '#ffffff'
                        }}>
                          {stock.currencySymbol || (isNse ? '₹' : '$')}
                          {typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                        </div>
                        <div style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: isUp ? 'var(--green-bright)' : 'var(--red-bright)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '2px'
                        }}>
                          <TrendingUp size={10} style={{ transform: isUp ? 'none' : 'rotate(180deg)' }} />
                          <span>{isUp ? '+' : ''}{typeof stock.changePct === 'number' ? stock.changePct.toFixed(2) : stock.changePct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No assets found matching "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exchange Filter Ribbon */}
        <div className="search-filter-ribbon">
          {EXCHANGE_FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`search-filter-tab ${exchangeFilter === f.id ? 'active' : ''}`}
              onClick={() => setExchangeFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Trending Equities Pills */}
        <div className="search-trending-strip">
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Quick Launch:
          </span>
          {[
            { sym: 'VBL', name: 'Varun Beverages', ex: 'NSE' },
            { sym: 'RELIANCE', name: 'Reliance', ex: 'NSE' },
            { sym: 'NVDA', name: 'Nvidia Corp', ex: 'NDX' },
            { sym: 'AAPL', name: 'Apple Inc', ex: 'NDX' },
            { sym: 'TCS', name: 'Tata Consultancy', ex: 'NSE' },
            { sym: 'TSLA', name: 'Tesla Inc', ex: 'NDX' }
          ].map(item => (
            <button
              key={item.sym}
              type="button"
              className="search-trending-pill"
              onClick={() => {
                selectTicker(item.sym);
                navigateTo('analysis', item.sym);
              }}
            >
              <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-bright)' }}>{item.sym}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Market Overview Metrics */}
        <div className="search-quick-stats">
          <div className="search-stat-card">
            <span className="search-stat-label">Indexed Equities</span>
            <span className="search-stat-val">12,798</span>
            <span className="search-stat-sub">Across 4 Major Exchanges</span>
          </div>
          <div className="search-stat-card">
            <span className="search-stat-label">Order Latency</span>
            <span className="search-stat-val">12 ms</span>
            <span className="search-stat-sub">Direct Feed Synchronized</span>
          </div>
          <div className="search-stat-card">
            <span className="search-stat-label">Real-Time Catalysts</span>
            <span className="search-stat-val">24 Active</span>
            <span className="search-stat-sub">AI Copilot Scanned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
