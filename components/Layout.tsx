import React from 'react';
import { Home, PlusCircle, PieChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'add' | 'stats';
  onTabChange: (tab: 'home' | 'add' | 'stats') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around items-center py-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[11px] font-medium">明细</span>
        </button>

        <button
          onClick={() => onTabChange('add')}
          className="flex flex-col items-center -mt-8"
        >
          <div className={`rounded-full p-4 shadow-lg transition-transform active:scale-95 ${
            activeTab === 'add' ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-brand-500 hover:bg-brand-600'
          }`}>
            <PlusCircle size={32} color="white" />
          </div>
          <span className={`text-[11px] font-medium mt-1 ${activeTab === 'add' ? 'text-brand-600' : 'text-gray-400'}`}>记一笔</span>
        </button>

        <button
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'stats' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PieChart size={24} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
          <span className="text-[11px] font-medium">统计</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;