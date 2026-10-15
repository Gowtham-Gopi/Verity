import './App.css';
import { VerityProvider, useVerity } from './context/VerityContext';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import WhatIf from './pages/WhatIf';
import Macro from './pages/Macro';

function AppShell() {
  const { activeTab } = useVerity();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'analysis':  return <Analysis />;
      case 'whatif':    return <WhatIf />;
      case 'macro':     return <Macro />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="content-area" key={activeTab}>
          {renderPage()}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default function App() {
  return (
    <VerityProvider>
      <AppShell />
    </VerityProvider>
  );
}
