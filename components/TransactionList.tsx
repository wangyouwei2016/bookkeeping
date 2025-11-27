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
  const size = 40; // Increased icon size
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
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
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
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <div className="bg-gray-100 p-8 rounded-full mb-4">
          <DollarSign size={64} />
        </div>
        <p className="text-3xl font-bold">暂无账单记录</p>
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
      <div className="space-y-5 pb-4">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-6 overflow-hidden">
              <div className={`p-5 rounded-3xl shrink-0 ${
                t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
              }`}>
                {getCategoryIcon(t.category)}
              </div>
              <div className="min-w-0 space-y-2">
                <div className="font-bold text-gray-800 text-3xl truncate leading-none">{t.category}</div>
                <div className="text-xl text-gray-400 flex items-center gap-3 flex-wrap">
                  <span className="shrink-0">{formatDate(t.date)}</span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full shrink-0"></span>
                  <span className={`px-3 py-1 rounded-xl text-base font-bold shrink-0 ${t.user === 'husband' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {formatUser(t.user)}
                  </span>
                </div>
                {t.note && (
                   <div className="text-gray-400 text-xl truncate max-w-[200px] mt-1.5">
                     {t.note}
                   </div>
                )}
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-4 shrink-0">
              <div className={`font-bold text-3xl tracking-tight ${
                t.type === 'expense' ? 'text-gray-900' : 'text-green-600'
              }`}>
                {t.type === 'expense' ? '-' : '+'}
                {t.amount.toFixed(0)}
              </div>
              
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setItemToDelete(t);
                }}
                className="p-4 -mr-4 -mb-4 text-gray-300 hover:text-red-500 transition-colors active:text-red-600 touch-manipulation"
                aria-label="删除"
              >
                <Trash2 size={32} />
              </button>
            </div>
          </div>
        ))}
        
        <div ref={loaderRef} className="py-8 flex justify-center items-center text-gray-400 min-h-[80px]">
          {hasMore ? (
            <div className="flex items-center gap-3 text-xl animate-pulse">
               <Loader2 size={32} className="animate-spin" />
               <span>加载更多...</span>
            </div>
          ) : (
             transactions.length > 0 && <span className="text-lg font-bold opacity-50">—— 到底啦 ——</span>
          )}
        </div>
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div 
            className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">删除确认</h3>
              <p className="text-gray-500 mb-10 leading-relaxed text-2xl">
                您确定要删除这笔 <span className="font-bold text-gray-800">{itemToDelete.category}</span> 的记录吗？
                <br />
                金额：<span className="font-bold text-gray-800 text-3xl">¥{itemToDelete.amount}</span>
              </p>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-3xl transition-colors text-2xl"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-5 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-3xl shadow-lg shadow-red-200 transition-colors text-2xl"
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