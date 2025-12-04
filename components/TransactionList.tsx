import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { ShoppingBag, Coffee, Car, Home, Film, DollarSign, Activity, Briefcase, Gift, GraduationCap, Baby, Trash2, ShieldCheck, Receipt, AlertTriangle, Loader2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

const getCategoryIcon = (category: string) => {
  const size = 40; // Reduced from 56px to 40px for better mobile fit
  switch (category) {
    case '餐饮': return <Coffee size={size} />;
    case '购物': return <ShoppingBag size={size} />;
    case '生活费用': return <Receipt size={size} />;
    case '交通': return <Car size={size} />;
    case '居住': return <Home size={size} />;
    case '娱乐': return <Film size={size} />;
    case '保险': return <ShieldCheck size={size} />;
    case '工资': return <DollarSign size={size} />;
    case '医疗': return <Activity size={size} />;
    case '旅行': return <Briefcase size={size} />;
    case '教育': return <GraduationCap size={size} />;
    case '育儿': return <Baby size={size} />;
    case '红包': return <Gift size={size} />;
    case '奖金': return <Gift size={size} />;
    case '理财': return <Activity size={size} />;
    default: return <DollarSign size={size} />;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) return '今天';
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + '日';
};

const formatUser = (user: string) => {
  return user === 'husband' ? '丈夫' : '妻子';
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, hasMore, onLoadMore }) => {
  // State to track which item is being deleted. If null, modal is closed.
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  
  // Ref for the bottom loader element
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Pre-load when within 100px of bottom
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, onLoadMore]);

  if (transactions.length === 0 && !hasMore) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <div className="bg-gray-100 p-8 sm:p-10 rounded-full mb-6">
          <DollarSign className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>
        <p className="text-2xl sm:text-3xl font-medium">暂无账单记录</p>
      </div>
    );
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5 pb-6 sm:pb-8">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 overflow-hidden">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 ${
                t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
              }`}>
                {getCategoryIcon(t.category)}
              </div>
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <div className="font-bold text-gray-800 text-xl sm:text-2xl md:text-2xl truncate">{t.category}</div>
                <div className="text-sm sm:text-base text-gray-400 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="shrink-0 font-medium">{formatDate(t.date)}</span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-200 rounded-full shrink-0"></span>
                  <span className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shrink-0 ${t.user === 'husband' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {formatUser(t.user)}
                  </span>
                </div>
                {t.note && (
                   <div className="text-gray-400 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px] md:max-w-[280px] mt-1">
                     {t.note}
                   </div>
                )}
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-2 sm:gap-3 shrink-0">
              <div className={`font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight ${
                t.type === 'expense' ? 'text-gray-900' : 'text-green-600'
              }`}>
                {t.type === 'expense' ? '-' : '+'}
                {t.amount.toFixed(0)}
              </div>
              
              {/* Delete Button Area */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setItemToDelete(t);
                }}
                className="p-2 sm:p-3 -mr-2 sm:-mr-3 -mb-2 sm:-mb-3 text-gray-300 hover:text-red-500 transition-colors active:text-red-600 touch-manipulation"
                aria-label="删除"
              >
                <Trash2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Loading / End of List Indicator */}
        <div ref={loaderRef} className="py-6 sm:py-8 flex justify-center items-center text-gray-400 min-h-[80px] sm:min-h-[100px]">
          {hasMore ? (
            <div className="flex items-center gap-3 text-lg sm:text-xl animate-pulse">
               <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
               <span>加载更多...</span>
            </div>
          ) : (
             transactions.length > 0 && <span className="text-base sm:text-lg font-medium opacity-50">—— 到底啦 ——</span>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div 
            className="bg-white rounded-3xl sm:rounded-[3rem] w-full max-w-md sm:max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8 md:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <AlertTriangle className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">删除确认</h3>
              <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 leading-relaxed">
                您确定要删除这笔 <span className="font-bold text-gray-800">{itemToDelete.category}</span> 的记录吗？
                <br />
                金额：<span className="font-bold text-gray-800 text-xl sm:text-2xl">¥{itemToDelete.amount}</span>
              </p>
              
              <div className="flex gap-4 sm:gap-6">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-4 sm:py-5 md:py-6 px-4 sm:px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl sm:rounded-[2rem] transition-colors text-lg sm:text-xl"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 sm:py-5 md:py-6 px-4 sm:px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl sm:rounded-[2rem] shadow-lg shadow-red-200 transition-colors text-lg sm:text-xl"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;