import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import FloatingActionButton from './FloatingActionButton';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { settings, sidebarOpen, setSidebarOpen } = useStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // Apply dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        {isMobile && (
          <div
            className="flex items-center justify-between px-4 h-14 border-b"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                💚 MoneyFlow
              </span>
            </div>
            <div className="w-9" />
          </div>
        )}

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--bg-primary)' }}
        >
          <div className={`animate-fade-in ${isMobile ? 'pb-24' : ''}`}>
            {children}
          </div>
        </main>

        {/* Floating action button for mobile */}
        {isMobile && <FloatingActionButton />}

        {/* Mobile bottom navigation */}
        {isMobile && <MobileNav />}
      </div>
    </div>
  );
};

export default Layout;
