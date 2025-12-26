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
  const size = 28; // Adjusted for 16px baseline
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

// Helper function to parse date string as local date
const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (dateStr: string) => {
  const date = parseLocalDate(dateStr);
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-300">
        <div className="bg-gray-100 p-6 sm:p-8 rounded-full mb-4">
          <DollarSign className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <p className="text-xl sm:text-2xl font-medium">暂无账单记录</p>
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
      <div className="space-y-3 sm:space-y-4 pb-6">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2.5 rounded-lg shrink-0 ${
                t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
              }`}>
                {getCategoryIcon(t.category)}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-gray-800 text-lg sm:text-xl truncate">{t.category}</div>
                <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2 flex-wrap">
                  <span className="shrink-0 font-medium">{formatDate(t.date)}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full shrink-0"></span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold shrink-0 ${t.user === 'husband' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {formatUser(t.user)}
                  </span>
                </div>
                {t.note && (
                   <div className="text-gray-400 text-xs sm:text-sm truncate max-w-[150px] mt-0.5">
                     {t.note}
                   </div>
                )}
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1 sm:gap-2 shrink-0">
              <div className={`font-bold text-lg sm:text-xl tracking-tight ${
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
                className="p-1.5 -mr-1 -mb-1 text-gray-300 hover:text-red-500 transition-colors active:text-red-600 touch-manipulation"
                aria-label="删除"
              >
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Loading / End of List Indicator */}
        <div ref={loaderRef} className="py-4 sm:py-6 flex justify-center items-center text-gray-400 min-h-[60px]">
          {hasMore ? (
            <div className="flex items-center gap-2 text-sm sm:text-base animate-pulse">
               <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
               <span>加载更多...</span>
            </div>
          ) : (
             transactions.length > 0 && <span className="text-xs sm:text-sm font-medium opacity-50">—— 到底啦 ——</span>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">删除确认</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 leading-relaxed">
                您确定要删除这笔 <span className="font-bold text-gray-800">{itemToDelete.category}</span> 的记录吗？
                <br />
                金额：<span className="font-bold text-gray-800 text-base sm:text-lg">¥{itemToDelete.amount}</span>
              </p>

              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 sm:py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 sm:py-4 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-red-200 transition-colors text-sm sm:text-base"
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