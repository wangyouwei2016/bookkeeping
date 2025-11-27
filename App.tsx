
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TransactionList from './components/TransactionList';
import { Transaction, UserType, TransactionType, CATEGORIES } from './types';
import { parseTransactionWithGemini } from './services/geminiService';
import { getSupabase, saveSupabaseConfig, clearSupabaseConfig, testConnection, getStoredConfig, initSupabase } from './services/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Mic, Send, Sparkles, Loader2, User as UserIcon, Calendar, Tag, FileText, LogOut, Database, Settings, AlertCircle } from 'lucide-react';

// --- Components ---

// -1. CONFIG SCREEN (If no database connected)
const ConfigScreen = ({ onConfigSuccess }: { onConfigSuccess: (client: SupabaseClient) => void }) => {
  const stored = getStoredConfig();
  const [url, setUrl] = useState(stored.url || '');
  const [key, setKey] = useState(stored.key || '');
  const [error, setError] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsTesting(true);
    
    if (!url.startsWith('http')) {
      setError('Project URL 必须以 http 或 https 开头');
      setIsTesting(false);
      return;
    }
    
    try {
      // 1. 测试连接
      await testConnection(url, key);
      
      // 2. 保存配置
      saveSupabaseConfig(url, key);
      
      // 3. 获取新实例并通知父组件
      const client = getSupabase();
      if (client) {
        onConfigSuccess(client);
      } else {
        throw new Error("客户端初始化失败");
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "未知错误";
      if (msg.includes("relation") && msg.includes("does not exist")) {
        msg = "连接成功，但找不到 'transactions' 表。请在 Supabase SQL Editor 中运行建表语句。";
      } else if (msg.includes("fetch")) {
        msg = "网络连接失败，请检查 URL 是否正确";
      }
      setError(msg);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
        <Database size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">连接云端账本</h1>
      <p className="text-gray-500 mb-10 text-base max-w-xs leading-relaxed">
        为了支持多人同步，请配置 Supabase 数据库。
        <br/>数据将安全存储在您自己的账号中。
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 max-w-sm w-full text-left border border-red-100">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="break-all text-base">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="w-full max-w-sm space-y-5 text-left">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">Project URL</label>
          <input 
            type="text" 
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://xyz.supabase.co"
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-brand-500 outline-none font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">Anon Public Key</label>
          <input 
            type="password" 
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="eyJxh..."
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-brand-500 outline-none font-mono"
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={isTesting}
          className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all mt-6 disabled:opacity-70 flex items-center justify-center gap-2 text-lg"
        >
          {isTesting && <Loader2 size={24} className="animate-spin" />}
          {isTesting ? '验证连接中...' : '连接数据库'}
        </button>
        
        <div className="text-sm text-gray-400 mt-8 leading-relaxed bg-gray-100 p-4 rounded-xl">
           <strong className="text-gray-600">首次使用？</strong><br/>
           请在 Supabase SQL Editor 运行：<br/>
           <code className="block mt-2 text-xs text-gray-500 bg-gray-200 p-2 rounded select-all font-mono">
             create table transactions (id uuid default gen_random_uuid() primary key, amount numeric, category text, type text, date text, note text, recorded_by text, created_at bigint);
           </code>
        </div>
      </form>
    </div>
  );
};

// 0. LOGIN / IDENTITY SELECTION SCREEN
const LoginScreen = ({ onLogin, onResetConfig }: { onLogin: (user: UserType) => void, onResetConfig: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center p-6 text-center relative">
      <button 
        onClick={() => { if(confirm('确定要清除数据库配置吗？')) onResetConfig(); }}
        className="absolute top-6 right-6 p-3 text-gray-400 hover:text-gray-600"
      >
        <Settings size={24} />
      </button>

      <div className="w-24 h-24 bg-brand-500 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-200 mb-8 rotate-3">
        <Sparkles size={48} className="text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-3">欢迎使用夫妻账本</h1>
      <p className="text-gray-500 mb-12 text-lg">请选择您的身份，开始共同记账</p>
      
      <div className="space-y-5 w-full max-w-xs">
        <button 
          onClick={() => onLogin('husband')}
          className="w-full py-6 bg-white hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 text-gray-800 rounded-3xl shadow-sm flex items-center justify-center gap-4 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserIcon size={24} />
          </div>
          <span className="font-bold text-xl">我是丈夫</span>
        </button>
        
        <button 
          onClick={() => onLogin('wife')}
          className="w-full py-6 bg-white hover:bg-pink-50 border-2 border-transparent hover:border-pink-200 text-gray-800 rounded-3xl shadow-sm flex items-center justify-center gap-4 transition-all"
        >
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
            <UserIcon size={24} />
          </div>
          <span className="font-bold text-xl">我是妻子</span>
        </button>
      </div>
    </div>
  );
};

// 1. HOME DASHBOARD
const Dashboard = ({ 
  transactions, 
  onDelete,
  currentUser,
  onChangeUser,
  isLoading
}: { 
  transactions: Transaction[], 
  onDelete: (id: string) => void,
  currentUser: UserType,
  onChangeUser: () => void,
  isLoading: boolean
}) => {
  const totalBalance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  
  // Get current month stats
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const monthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-center mb-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">夫妻账本</h1>
           <p className="text-sm text-gray-400 mt-1">
             当前身份: <span className="font-bold text-brand-600">{currentUser === 'husband' ? '丈夫' : '妻子'}</span>
           </p>
        </div>
        <button onClick={onChangeUser} className="p-3 bg-white rounded-full shadow-sm text-gray-400 hover:text-brand-600">
          <LogOut size={22} />
        </button>
      </header>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-200/50">
        <div className="text-brand-100 text-base font-medium mb-2">家庭总结余</div>
        <div className="text-5xl font-bold mb-8">
          {isLoading ? '...' : `¥${totalBalance.toFixed(2)}`}
        </div>
        
        <div className="flex gap-6">
          <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-brand-100 text-sm mb-1">本月收入</div>
            <div className="font-bold text-2xl text-emerald-300">
              {isLoading ? '...' : `+${monthIncome.toFixed(0)}`}
            </div>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-brand-100 text-sm mb-1">本月支出</div>
            <div className="font-bold text-2xl text-rose-300">
              {isLoading ? '...' : `-${monthExpense.toFixed(0)}`}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          最近明细
          {isLoading && <Loader2 size={18} className="animate-spin text-gray-400" />}
        </h2>
        <TransactionList transactions={transactions.slice(0, 10)} onDelete={onDelete} />
      </div>
    </div>
  );
};

// 2. ADD TRANSACTION PAGE
const AddTransaction = ({ onAdd, currentUser, isSaving }: { onAdd: (t: Transaction) => void, currentUser: UserType, isSaving: boolean }) => {
  const [activeUser, setActiveUser] = useState<UserType>(currentUser);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [smartInput, setSmartInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setActiveUser(currentUser);
  }, [currentUser]);

  const handleSmartParse = async () => {
    if (!smartInput.trim()) return;
    setIsAnalyzing(true);
    const result = await parseTransactionWithGemini(smartInput);
    setIsAnalyzing(false);

    if (result) {
      if (result.amount) setAmount(result.amount.toString());
      if (result.category) {
        const catList = result.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
        const match = catList.find(c => c === result.category) || result.category;
        setCategory(match);
      }
      if (result.type) setType(result.type);
      if (result.date) setDate(result.date);
      if (result.note) setNote(result.note);
      setSmartInput('');
    } else {
      alert("没听懂，试着说 '午饭 50' 或 '发工资 5000'");
    }
  };

  const toggleListening = () => {
    if (isListening) return; 

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别功能");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      const cleanResult = speechResult.replace(/[。，！？]$/, '');
      setSmartInput(cleanResult);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    if (isSaving) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      category,
      type,
      date,
      note,
      user: activeUser,
      createdAt: Date.now()
    };
    onAdd(newTransaction);
    // Reset
    setAmount('');
    setNote('');
    setSmartInput('');
  };

  return (
    <div className="p-6 pb-28">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">记一笔</h2>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
        <label className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
          <Sparkles size={16} /> AI 智能记账
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="例如：昨天超市买菜花了200"
            className="flex-1 bg-gray-50 border-none rounded-xl text-base px-4 py-3 focus:ring-2 focus:ring-brand-200"
          />
          <button 
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Mic size={24} />
          </button>
          <button 
            type="button"
            onClick={handleSmartParse}
            disabled={isAnalyzing || !smartInput}
            className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
           <span className="text-base text-gray-500 font-medium">记账人:</span>
           <div className="flex gap-3">
             <button
               type="button"
               onClick={() => setActiveUser('husband')}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                 activeUser === 'husband' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               丈夫
             </button>
             <button
               type="button"
               onClick={() => setActiveUser('wife')}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                 activeUser === 'wife' ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               妻子
             </button>
           </div>
        </div>

        <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
              className={`flex-1 py-4 border-2 rounded-2xl font-bold text-lg transition-all ${
                type === 'expense' ? 'border-accent-500 bg-accent-50 text-accent-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 py-4 border-2 rounded-2xl font-bold text-lg transition-all ${
                type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              收入
            </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">金额</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-4xl">¥</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-14 pr-6 py-8 text-5xl font-bold text-gray-800 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-300"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5"><Tag size={16}/> 分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg text-gray-700 focus:ring-brand-500 focus:border-brand-500 appearance-none"
            >
              {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5"><Calendar size={16}/> 日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg text-gray-700 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5"><FileText size={16}/> 备注 (选填)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这笔钱是干嘛的？"
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg text-gray-700 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-300/50 hover:bg-black active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
        >
          {isSaving && <Loader2 size={24} className="animate-spin" />}
          {isSaving ? '保存中...' : '保存记录'}
        </button>
      </form>
    </div>
  );
};

// 3. STATS PAGE
const Stats = ({ transactions }: { transactions: Transaction[] }) => {
  const [timeFilter, setTimeFilter] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const isYearMatch = d.getFullYear() === selectedDate.getFullYear();
    if (timeFilter === 'year') return isYearMatch;
    return isYearMatch && d.getMonth() === selectedDate.getMonth();
  });

  const expenseData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const found = acc.find(item => item.name === curr.category);
      if (found) found.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // New logic: User Income vs Expense
  const userStatsMap = {
    husband: { name: '丈夫', income: 0, expense: 0 },
    wife: { name: '妻子', income: 0, expense: 0 }
  };

  filteredTransactions.forEach(t => {
    const u = t.user as 'husband' | 'wife';
    if (userStatsMap[u]) {
      if (t.type === 'income') {
         userStatsMap[u].income += t.amount;
      } else {
         userStatsMap[u].expense += t.amount;
      }
    }
  });
  
  const userStatsData = [userStatsMap.husband, userStatsMap.wife];

  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
  
  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800">统计报表</h2>
         <div className="flex bg-gray-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${timeFilter === 'month' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              月度
            </button>
            <button 
              onClick={() => setTimeFilter('year')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${timeFilter === 'year' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              年度
            </button>
         </div>
      </header>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else newDate.setFullYear(newDate.getFullYear() - 1);
            setSelectedDate(newDate);
         }} className="p-2 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">{'<'}</button>
         
         <div className="font-bold text-xl text-gray-700">
           {selectedDate.getFullYear()}年
           {timeFilter === 'month' && ` ${selectedDate.getMonth() + 1}月`}
         </div>

         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else newDate.setFullYear(newDate.getFullYear() + 1);
            setSelectedDate(newDate);
         }} className="p-2 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">{'>'}</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <div className="text-sm text-emerald-600 mb-2">总收入</div>
            <div className="text-2xl font-bold text-emerald-700">+{totalIncome.toFixed(0)}</div>
         </div>
         <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <div className="text-sm text-rose-600 mb-2">总支出</div>
            <div className="text-2xl font-bold text-rose-700">-{totalExpense.toFixed(0)}</div>
         </div>
      </div>

      {expenseData.length > 0 || totalIncome > 0 ? (
        <>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">收支情况</h3>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={userStatsData} barGap={8} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={40} style={{fontSize: '14px', fontWeight: 'bold'}} />
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="top" align="right" iconType="circle" height={40}/>
                    <Bar dataKey="income" name="收入" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
                    <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">支出分类占比</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-gray-400 text-lg">该时间段暂无数据</div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Client state managed in App to trigger re-renders
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    return localStorage.getItem('coupleLedger_currentUser') as UserType | null;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'stats'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Supabase on mount
  useEffect(() => {
    const client = getSupabase();
    if (client) {
      setSupabaseClient(client);
    }
  }, []);

  // Load Transactions from Supabase
  useEffect(() => {
    if (!supabaseClient) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error.message);
      } else if (data) {
        // Map DB columns to App state
        const mappedData: Transaction[] = data.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          category: item.category,
          type: item.type,
          date: item.date,
          note: item.note,
          user: item.recorded_by as UserType, 
          createdAt: item.created_at
        }));
        setTransactions(mappedData);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [supabaseClient]);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('coupleLedger_currentUser', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('coupleLedger_currentUser');
    setActiveTab('home');
  };

  const handleAddTransaction = async (newT: Transaction) => {
    if (!supabaseClient) return;
    setIsSaving(true);
    
    // Optimistic update
    setTransactions(prev => [newT, ...prev]);
    setActiveTab('home');

    const { error } = await supabaseClient
      .from('transactions')
      .insert([{
        id: newT.id,
        amount: newT.amount,
        category: newT.category,
        type: newT.type,
        date: newT.date,
        note: newT.note,
        recorded_by: newT.user,
        created_at: newT.createdAt
      }]);

    if (error) {
      console.error('Error saving transaction:', error.message);
      alert('保存失败: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!supabaseClient) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    const { error } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error.message);
      alert('删除失败');
    }
  };
  
  const handleResetConfig = () => {
    clearSupabaseConfig();
    setSupabaseClient(null);
  };

  // 1. If no Supabase client, show config
  if (!supabaseClient) {
    return <ConfigScreen onConfigSuccess={setSupabaseClient} />;
  }

  // 2. If no user logged in, show login
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onResetConfig={handleResetConfig} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <Dashboard 
          transactions={transactions} 
          onDelete={handleDeleteTransaction} 
          currentUser={currentUser}
          onChangeUser={handleLogout}
          isLoading={isLoading}
        />
      )}
      {activeTab === 'add' && <AddTransaction onAdd={handleAddTransaction} currentUser={currentUser} isSaving={isSaving} />}
      {activeTab === 'stats' && <Stats transactions={transactions} />}
    </Layout>
  );
};

export default App;
