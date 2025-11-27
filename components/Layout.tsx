import React from 'react';
import { Home, PlusCircle, PieChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'add' | 'stats';
  onTabChange: (tab: 'home' | 'add' | 'stats') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    // Outer Container:
    // - Mobile: Simple block container occupying full viewport height (dvh).
    // - Desktop (lg+): Flex container for centering.
    <div className="w-full h-[100dvh] bg-gray-50 lg:min-h-screen lg:h-auto lg:flex lg:justify-center lg:items-center font-sans overflow-hidden">
      
      {/* App Shell:
          - Mobile: Full width/height, flex column.
          - Desktop (lg+): Fixed dimensions "phone" card style.
      */}
      <div className="w-full h-full flex flex-col relative bg-gray-50
                      lg:w-[480px] lg:h-[90vh] lg:max-h-[950px] lg:rounded-[3rem] lg:shadow-2xl lg:border lg:border-gray-200 lg:overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full relative overflow-y-auto no-scrollbar scroll-smooth">
          {/* Bottom padding ensures content isn't hidden behind the Nav Bar. 
              Using safe-area-inset-bottom for iPhone Home Bar adaptation. 
              Significantly increased padding for the extra tall nav bar. */}
          <div className="pb-[calc(9rem+env(safe-area-inset-bottom))] min-h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)] transition-all shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-around items-end h-28 pb-6">
            
            {/* Home Tab */}
            <button
              onClick={() => onTabChange('home')}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-full active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '60px' }}
            >
              <Home 
                size={34} 
                className={activeTab === 'home' ? 'text-brand-600' : 'text-gray-300'} 
                strokeWidth={activeTab === 'home' ? 2.5 : 2} 
              />
              <span className={`text-sm font-bold ${activeTab === 'home' ? 'text-brand-600' : 'text-gray-400'}`}>
                明细
              </span>
            </button>

            {/* Add Tab (Floating) */}
            <div className="relative -top-8 flex flex-col items-center justify-center w-24 touch-manipulation">
               <button
                onClick={() => onTabChange('add')}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl shadow-brand-300/50 transition-all active:scale-90 ${
                  activeTab === 'add' 
                    ? 'bg-brand-600 ring-8 ring-white' 
                    : 'bg-brand-500 hover:bg-brand-600 ring-8 ring-white'
                }`}
              >
                <PlusCircle size={44} color="white" />
              </button>
              <span className={`text-sm font-bold mt-2 ${activeTab === 'add' ? 'text-brand-600' : 'text-gray-400'}`}>
                记一笔
              </span>
            </div>

            {/* Stats Tab */}
            <button
              onClick={() => onTabChange('stats')}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-full active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '60px' }}
            >
              <PieChart 
                size={34} 
                className={activeTab === 'stats' ? 'text-brand-600' : 'text-gray-300'} 
                strokeWidth={activeTab === 'stats' ? 2.5 : 2} 
              />
              <span className={`text-sm font-bold ${activeTab === 'stats' ? 'text-brand-600' : 'text-gray-400'}`}>
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