
import React from 'react';
import { Transaction } from '../types';
import { ShoppingBag, Coffee, Car, Home, Film, DollarSign, Activity, Briefcase, Gift, GraduationCap, Baby } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case '餐饮': return <Coffee size={18} />;
    case '购物': return <ShoppingBag size={18} />;
    case '交通': return <Car size={18} />;
    case '居住': return <Home size={18} />;
    case '娱乐': return <Film size={18} />;
    case '工资': return <DollarSign size={18} />;
    case '医疗': return <Activity size={18} />;
    case '旅行': return <Briefcase size={18} />;
    case '教育': return <GraduationCap size={18} />;
    case '育儿': return <Baby size={18} />;
    case '红包': return <Gift size={18} />;
    case '奖金': return <Gift size={18} />;
    case '理财': return <Activity size={18} />;
    default: return <DollarSign size={18} />;
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
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="bg-gray-100 p-4 rounded-full mb-3">
          <DollarSign size={32} />
        </div>
        <p>暂无账单记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {transactions.map((t) => (
        <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${
              t.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
            }`}>
              {getCategoryIcon(t.category)}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{t.category}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>{formatDate(t.date)}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.user === 'husband' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {formatUser(t.user)}
                </span>
                {t.note && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="max-w-[100px] truncate">{t.note}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div className={`font-bold ${
              t.type === 'expense' ? 'text-gray-900' : 'text-green-600'
            }`}>
              {t.type === 'expense' ? '-' : '+'}
              {t.amount.toFixed(2)}
            </div>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm("确定要删除这条记录吗？")) onDelete(t.id);
                }}
                className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
             >
               删除
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;