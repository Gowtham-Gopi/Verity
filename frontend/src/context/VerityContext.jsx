import { createContext, useContext, useState, useCallback } from 'react';

const VerityContext = createContext(null);

export function VerityProvider({ children }) {
  const [activeTicker, setActiveTicker] = useState('NVDA');
  const [activeTab, setActiveTab] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemSynced, _setSystemSynced] = useState(true);
  const [lastSync, _setLastSync] = useState(() => new Date());

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const selectTicker = useCallback((ticker) => {
    setActiveTicker(ticker);
  }, []);

  const navigateTo = useCallback((tab, ticker = null) => {
    setActiveTab(tab);
    if (ticker) setActiveTicker(ticker);
  }, []);

  return (
    <VerityContext.Provider value={{
      activeTicker, selectTicker,
      activeTab, setActiveTab,
      navigateTo,
      searchQuery, setSearchQuery,
      systemSynced, lastSync,
      sidebarCollapsed, setSidebarCollapsed, toggleSidebar,
    }}>
      {children}
    </VerityContext.Provider>
  );
}

export function useVerity() {
  const ctx = useContext(VerityContext);
  if (!ctx) throw new Error('useVerity must be used within VerityProvider');
  return ctx;
}
