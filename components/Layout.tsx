import React from 'react';
import { Home, PlusCircle, PieChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'add' | 'stats';
  onTabChange: (tab: 'home' | 'add' | 'stats') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    // Mobile: Full screen (h-dvh), full width, no rounded corners.
    // Desktop (md+): Centered "Phone" card styling with borders and shadow.
    <div className="flex flex-col h-[100dvh] w-full bg-gray-50 relative md:h-[85vh] md:max-w-md md:mx-auto md:my-[5vh] md:rounded-[2.5rem] md:shadow-2xl md:overflow-hidden md:border-[8px] md:border-gray-900 box-border">
      
      {/* Main Content Area - Internal scrolling */}
      <main className="flex-1 overflow-y-auto no-scrollbar w-full">
        {/* Padding bottom ensures content isn't covered by the absolute nav bar */}
        <div className="pb-28 min-h-full">
            {children}
        </div>
      </main>

      {/* Bottom Navigation - Absolute to stick to bottom of container */}
      <nav className="absolute bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 flex justify-around items-center pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
          className="flex flex-col items-center -mt-8 relative z-10"
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