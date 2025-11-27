import React from 'react';
import { Home, PlusCircle, PieChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'add' | 'stats';
  onTabChange: (tab: 'home' | 'add' | 'stats') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    // Outer Container
    <div className="w-full h-[100dvh] bg-gray-50 lg:min-h-screen lg:h-auto lg:flex lg:justify-center lg:items-center font-sans overflow-hidden">
      
      {/* App Shell */}
      <div className="w-full h-full flex flex-col relative bg-gray-50
                      lg:w-[480px] lg:h-[960px] lg:rounded-[3rem] lg:shadow-2xl lg:border lg:border-gray-200 lg:overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full relative overflow-y-auto no-scrollbar scroll-smooth">
          {/* Increased bottom padding for the taller (h-32) nav bar */}
          <div className="pb-[calc(9rem+env(safe-area-inset-bottom))] min-h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Bar - Height increased to h-32 (128px) */}
        <nav className="absolute bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)] transition-all shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-around items-end h-32 pb-6">
            
            {/* Home Tab */}
            <button
              onClick={() => onTabChange('home')}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-full active:scale-95 transition-transform touch-manipulation"
            >
              <Home 
                size={36} 
                className={activeTab === 'home' ? 'text-brand-600' : 'text-gray-400'} 
                strokeWidth={activeTab === 'home' ? 2.5 : 2} 
              />
              <span className={`text-base font-bold ${activeTab === 'home' ? 'text-brand-600' : 'text-gray-400'}`}>
                明细
              </span>
            </button>

            {/* Add Tab (Floating) - Larger Size */}
            <div className="relative -top-12 flex flex-col items-center justify-center w-32 touch-manipulation">
               <button
                onClick={() => onTabChange('add')}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl shadow-brand-500/30 transition-all active:scale-90 ${
                  activeTab === 'add' 
                    ? 'bg-brand-600 ring-8 ring-white' 
                    : 'bg-brand-500 hover:bg-brand-600 ring-8 ring-white'
                }`}
              >
                <PlusCircle size={60} color="white" />
              </button>
              <span className={`text-base font-bold mt-2 ${activeTab === 'add' ? 'text-brand-600' : 'text-gray-400'}`}>
                记一笔
              </span>
            </div>

            {/* Stats Tab */}
            <button
              onClick={() => onTabChange('stats')}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-full active:scale-95 transition-transform touch-manipulation"
            >
              <PieChart 
                size={36} 
                className={activeTab === 'stats' ? 'text-brand-600' : 'text-gray-400'} 
                strokeWidth={activeTab === 'stats' ? 2.5 : 2} 
              />
              <span className={`text-base font-bold ${activeTab === 'stats' ? 'text-brand-600' : 'text-gray-400'}`}>
                统计
              </span>
            </button>
            
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;