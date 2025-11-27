import React, { useState } from 'react';
import { Transaction } from '../types';
import { ShoppingBag, Coffee, Car, Home, Film, DollarSign, Activity, Briefcase, Gift, GraduationCap, Baby, Trash2, ShieldCheck, Receipt, AlertTriangle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  const size = 32; // Significantly increased icon size
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

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  // State to track which item is being deleted. If null, modal is closed.
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <DollarSign size={48} />
        </div>
        <p className="text-xl font-medium">暂无账单记录</p>
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
      <div className="space-y-5 pb-6">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-5 overflow-hidden">
              <div className={`p-4 rounded-2xl shrink-0 ${
                t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
              }`}>
                {getCategoryIcon(t.category)}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="font-bold text-gray-800 text-xl truncate">{t.category}</div>
                <div className="text-base text-gray-400 flex items-center gap-2 flex-wrap">
                  <span className="shrink-0 font-medium">{formatDate(t.date)}</span>
                  <span className="w-1.5 h-1.5 bg-gray-200 rounded-full shrink-0"></span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold shrink-0 ${t.user === 'husband' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {formatUser(t.user)}
                  </span>
                </div>
                {t.note && (
                   <div className="text-gray-400 text-sm truncate max-w-[140px] sm:max-w-[200px] mt-0.5">
                     {t.note}
                   </div>
                )}
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-2 shrink-0">
              <div className={`font-extrabold text-2xl tracking-tight ${
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
                className="p-3 -mr-3 -mb-2 text-gray-300 hover:text-red-500 transition-colors active:text-red-600 touch-manipulation"
                aria-label="删除"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">删除确认</h3>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                您确定要删除这笔 <span className="font-bold text-gray-800">{itemToDelete.category}</span> 的记录吗？
                <br />
                金额：<span className="font-bold text-gray-800 text-xl">¥{itemToDelete.amount}</span>
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-xl"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-colors text-xl"
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