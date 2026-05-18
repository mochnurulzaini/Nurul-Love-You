import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Transactions from './screens/Transactions';
import Analytics from './screens/Analytics';
import Budget from './screens/Budget';
import Savings from './screens/Savings';
import Settings from './screens/Settings';
import Categories from './screens/Categories';
import PinLock from './components/PinLock';

const App: React.FC = () => {
  const { activeTab, settings } = useStore();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (settings.pinEnabled && settings.pin) {
      setIsLocked(true);
    }
  }, []);

  if (isLocked) {
    return (
      <PinLock
        correctPin={settings.pin}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'analytics': return <Analytics />;
      case 'budget': return <Budget />;
      case 'savings': return <Savings />;
      case 'categories': return <Categories />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
      <Layout>
        <div key={activeTab} className="animate-fade-in">
          {renderScreen()}
        </div>
      </Layout>
    </>
  );
};

export default App;
