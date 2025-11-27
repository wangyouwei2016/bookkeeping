import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import TransactionList from './components/TransactionList';
import { Transaction, UserType, TransactionType, CATEGORIES } from './types';
import { parseTransactionWithGemini } from './services/geminiService';
import { getSupabase, saveSupabaseConfig, clearSupabaseConfig, testConnection, getStoredConfig, initSupabase } from './services/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts';
import { Mic, Send, Sparkles, Loader2, User as UserIcon, Calendar, Tag, FileText, LogOut, Database, Settings, AlertCircle, CloudCog, Globe, Key, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col p-8 font-sans overflow-y-auto relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-brand-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute top-[40%] left-[20%] w-[40%] h-[20%] bg-white rounded-full blur-[80px] opacity-60"></div>
       </div>

      {/* Header Area */}
      <div className="mt-16 mb-16 px-6 relative z-10">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-brand-600 mb-8 shadow-lg shadow-brand-100 ring-4 ring-white/50">
           <Database size={48} />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          私有数据库<br/>连接配置
        </h1>
        <p className="text-3xl text-gray-600 font-medium leading-relaxed">
          可以使用您自己的数据库<br/>保证数据的绝对私密性
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-10 shadow-xl shadow-brand-900/5 border border-white mb-10 relative z-10">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] text-2xl font-bold mb-10 flex items-start gap-4 text-left border border-red-100 animate-in fade-in">
              <AlertCircle size={32} className="shrink-0 mt-1" />
              <span className="break-all leading-normal">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-12">
            <div className="space-y-5">
              <label className="block text-3xl font-bold text-gray-700 ml-4">Project URL</label>
              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Globe size={40} />
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full h-32 pl-28 pr-8 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-[2.5rem] text-3xl font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-5">
              <label className="block text-3xl font-bold text-gray-700 ml-4">Anon Public Key</label>
              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Key size={40} />
                </div>
                <input 
                  type="password" 
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="eyJxh..."
                  className="w-full h-32 pl-28 pr-8 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-[2.5rem] text-3xl font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isTesting}
              className="w-full h-32 mt-8 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-[2.5rem] font-bold shadow-2xl shadow-brand-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-6 text-4xl"
            >
              {isTesting ? (
                <>
                  <Loader2 size={48} className="animate-spin" />
                  <span>连接中...</span>
                </>
              ) : (
                <>
                  <span>确认连接</span>
                  <ChevronRight size={48} className="opacity-80" />
                </>
              )}
            </button>
            
          </form>
      </div>

      <div className="text-center px-8 pb-10 relative z-10">
          <p className="text-gray-500 text-2xl font-medium leading-relaxed">
            首次使用请确保已在 Supabase SQL Editor 中创建了 <span className="font-bold text-brand-700 font-mono">transactions</span> 表
          </p>
      </div>
    </div>
  );
};

// 0. LOGIN / IDENTITY SELECTION SCREEN
const LoginScreen = ({ onLogin, onResetConfig }: { onLogin: (user: UserType) => void, onResetConfig: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-pink-200 rounded-full blur-[100px]"></div>
      </div>

      <button 
        onClick={() => { if(confirm('确定要清除数据库配置吗？')) onResetConfig(); }}
        className="absolute top-10 right-10 p-8 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform z-10"
      >
        <Settings size={48} />
      </button>

      <div className="w-40 h-40 bg-brand-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-brand-200 mb-16 rotate-3 z-10">
        <Sparkles size={80} className="text-white" />
      </div>
      <h1 className="text-7xl font-bold text-gray-800 mb-8 z-10 tracking-tight">夫妻账本</h1>
      <p className="text-gray-500 mb-24 text-4xl z-10 font-medium">请选择您的身份</p>
      
      <div className="space-y-10 w-full max-w-lg z-10">
        <button 
          onClick={() => onLogin('husband')}
          className="w-full py-12 bg-white hover:bg-blue-50 border-4 border-white hover:border-blue-100 text-gray-800 rounded-[3rem] shadow-xl flex items-center justify-center gap-8 transition-all active:scale-[0.98]"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserIcon size={56} />
          </div>
          <span className="font-bold text-5xl">我是丈夫</span>
        </button>
        
        <button 
          onClick={() => onLogin('wife')}
          className="w-full py-12 bg-white hover:bg-pink-50 border-4 border-white hover:border-pink-100 text-gray-800 rounded-[3rem] shadow-xl flex items-center justify-center gap-8 transition-all active:scale-[0.98]"
        >
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
            <UserIcon size={56} />
          </div>
          <span className="font-bold text-5xl">我是妻子</span>
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
  // Get current month stats
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const monthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  
  // Requirement: Main balance shows "Monthly Balance" instead of Total
  const monthBalance = monthIncome - monthExpense;

  return (
    <div className="p-8 space-y-14">
      <header className="flex justify-between items-center pt-6">
        <div>
           <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">夫妻账本</h1>
           <p className="text-3xl text-gray-500 mt-4 font-medium">
             当前身份: <span className="font-bold text-brand-600 bg-brand-50 px-4 py-2 rounded-2xl">{currentUser === 'husband' ? '丈夫' : '妻子'}</span>
           </p>
        </div>
        <button onClick={onChangeUser} className="p-6 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-gray-400 hover:text-brand-600 active:scale-95 transition-all">
          <LogOut size={40} />
        </button>
      </header>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-600 rounded-[4rem] p-12 text-white shadow-2xl shadow-brand-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="text-brand-100 text-3xl font-medium mb-6">本月结余</div>
          <div className="text-8xl font-extrabold mb-14 tracking-tight leading-none">
            {isLoading ? '...' : `¥${monthBalance.toFixed(0)}`}
          </div>
          
          <div className="flex gap-10">
            <div className="flex-1 bg-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-2xl font-medium mb-3">本月收入</div>
              <div className="font-bold text-5xl text-emerald-300">
                {isLoading ? '...' : `+${monthIncome.toFixed(0)}`}
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-2xl font-medium mb-3">本月支出</div>
              <div className="font-bold text-5xl text-rose-300">
                {isLoading ? '...' : `-${monthExpense.toFixed(0)}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-bold text-gray-800 mb-10 flex items-center gap-6">
          最近明细
          {isLoading && <Loader2 size={40} className="animate-spin text-gray-400" />}
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
  const recognitionRef = useRef<any>(null);

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
    // 如果正在录音，再次点击则停止
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别功能，请尝试使用 Chrome 或 Safari");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN'; 
      // 开启临时结果，这样说话时能实时看到文字，体验更好
      recognition.interimResults = true; 
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // 去除末尾可能的标点
        const cleanResult = transcript.replace(/[。，！？]$/, '');
        setSmartInput(cleanResult);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          alert("请允许麦克风权限");
        } else if (event.error === 'network') {
          alert("网络错误，语音识别需要联网");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      alert("无法启动语音识别");
      setIsListening(false);
    }
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
    <div className="p-8 pb-48">
      <h2 className="text-5xl font-bold text-gray-800 mb-12 pt-6">记一笔</h2>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-brand-100 mb-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-full bg-brand-500"></div>
        <label className="text-2xl font-bold text-brand-600 uppercase tracking-wider mb-6 block flex items-center gap-3">
          <Sparkles size={32} /> AI 智能记账
        </label>
        <div className="flex gap-6">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="例如：买菜200"
            className="flex-1 bg-gray-50 border-none rounded-[2rem] text-3xl px-8 py-8 focus:ring-4 focus:ring-brand-200"
          />
          <button 
            type="button"
            onClick={toggleListening}
            className={`p-8 rounded-[2rem] transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Mic size={40} />
          </button>
          <button 
            type="button"
            onClick={handleSmartParse}
            disabled={isAnalyzing || !smartInput}
            className="p-8 bg-brand-600 text-white rounded-[2rem] hover:bg-brand-700 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={40} className="animate-spin" /> : <Send size={40} />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="flex items-center gap-8 bg-gray-50 p-8 rounded-[3rem] border border-dashed border-gray-200">
           <span className="text-3xl text-gray-500 font-bold shrink-0">记账人:</span>
           <div className="flex gap-6 flex-1">
             <button
               type="button"
               onClick={() => setActiveUser('husband')}
               className={`flex-1 py-6 rounded-[2rem] text-3xl font-bold transition-colors ${
                 activeUser === 'husband' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               丈夫
             </button>
             <button
               type="button"
               onClick={() => setActiveUser('wife')}
               className={`flex-1 py-6 rounded-[2rem] text-3xl font-bold transition-colors ${
                 activeUser === 'wife' ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               妻子
             </button>
           </div>
        </div>

        <div className="flex gap-8">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
              className={`flex-1 py-8 border-4 rounded-[2.5rem] font-bold text-4xl transition-all ${
                type === 'expense' ? 'border-accent-500 bg-accent-50 text-accent-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 py-8 border-4 rounded-[2.5rem] font-bold text-4xl transition-all ${
                type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              收入
            </button>
        </div>

        <div>
          <label className="block text-3xl font-bold text-gray-500 mb-6 ml-4">金额</label>
          <div className="relative">
            <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-8xl">¥</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-28 pr-12 py-16 text-9xl font-extrabold text-gray-800 bg-gray-50 rounded-[3rem] border-none focus:ring-8 focus:ring-brand-500/20 outline-none placeholder-gray-200 tracking-tight"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10">
          <div>
            <label className="block text-3xl font-bold text-gray-500 mb-6 flex items-center gap-3 ml-4"><Tag size={32}/> 分类</label>
            <div className="relative">
               <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-8 bg-white border border-gray-200 rounded-[2.5rem] text-3xl font-bold text-gray-800 focus:ring-4 focus:ring-brand-500 appearance-none shadow-sm h-32"
              >
                {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-3xl font-bold text-gray-500 mb-6 flex items-center gap-3 ml-4"><Calendar size={32}/> 日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-8 bg-white border border-gray-200 rounded-[2.5rem] text-3xl font-bold text-gray-800 focus:ring-4 focus:ring-brand-500 shadow-sm h-32"
            />
          </div>
        </div>

        <div>
          <label className="block text-3xl font-bold text-gray-500 mb-6 flex items-center gap-3 ml-4"><FileText size={32}/> 备注 (选填)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这笔钱是干嘛的？"
            className="w-full p-8 bg-white border border-gray-200 rounded-[2.5rem] text-3xl text-gray-800 focus:ring-4 focus:ring-brand-500 shadow-sm placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-10 bg-gray-900 text-white rounded-[3rem] font-bold text-4xl shadow-xl shadow-gray-400/40 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-6 mt-12"
        >
          {isSaving && <Loader2 size={48} className="animate-spin" />}
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

  // --- Annual Trend Data Logic ---
  let annualTrendData: { name: string; balance: number }[] = [];
  if (timeFilter === 'year') {
    // Generate data for 12 months
    annualTrendData = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i;
      // Filter transactions for this month in the selected year
      const monthTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === monthIndex;
      });
      const mInc = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const mExp = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return {
        name: `${i + 1}月`,
        balance: mInc - mExp
      };
    });
  }

  const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
  
  return (
    <div className="p-8 space-y-12 pb-48">
      <header className="flex justify-between items-center pt-6">
         <h2 className="text-5xl font-bold text-gray-800">统计报表</h2>
         <div className="flex bg-gray-100 p-4 rounded-3xl">
            <button 
              onClick={() => setTimeFilter('month')}
              className={`px-8 py-4 text-2xl font-bold rounded-2xl transition-all ${timeFilter === 'month' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              月度
            </button>
            <button 
              onClick={() => setTimeFilter('year')}
              className={`px-8 py-4 text-2xl font-bold rounded-2xl transition-all ${timeFilter === 'year' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              年度
            </button>
         </div>
      </header>

      <div className="flex items-center justify-between bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else newDate.setFullYear(newDate.getFullYear() - 1);
            setSelectedDate(newDate);
         }} className="p-6 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-3xl">{'<'}</button>
         
         <div className="font-bold text-4xl text-gray-800">
           {selectedDate.getFullYear()}年
           {timeFilter === 'month' && ` ${selectedDate.getMonth() + 1}月`}
         </div>

         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else newDate.setFullYear(newDate.getFullYear() + 1);
            setSelectedDate(newDate);
         }} className="p-6 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-3xl">{'>'}</button>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100">
            <div className="text-2xl text-emerald-600 mb-6 font-bold">总收入</div>
            <div className="text-5xl font-extrabold text-emerald-700">+{totalIncome.toFixed(0)}</div>
         </div>
         <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100">
            <div className="text-2xl text-rose-600 mb-6 font-bold">总支出</div>
            <div className="text-5xl font-extrabold text-rose-700">-{totalExpense.toFixed(0)}</div>
         </div>
      </div>

      {/* Annual Trend Chart (Only for Year view) */}
      {timeFilter === 'year' && (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-500 uppercase tracking-wider mb-12">存钱趋势 (月度结余)</h3>
          <div className="h-96 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={annualTrendData} margin={{ left: 10, right: 30, top: 20, bottom: 10 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 20, fill: '#9ca3af', dy: 20}} />
                 <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                 <RechartsTooltip 
                   formatter={(value: number) => `¥${value.toFixed(0)}`}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)', fontSize: '20px', padding: '16px' }}
                   labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="balance" 
                   name="结余"
                   stroke="#14b8a6" 
                   strokeWidth={5} 
                   dot={{ r: 6, fill: '#14b8a6', strokeWidth: 4, stroke: '#fff' }}
                   activeDot={{ r: 10, strokeWidth: 0 }}
                 />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {(expenseData.length > 0 || totalIncome > 0) ? (
        <>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-500 uppercase tracking-wider mb-12">收支对比</h3>
            <div className="h-96 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={userStatsData} barGap={16} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} style={{fontSize: '24px', fontWeight: 'bold'}} />
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)', fontSize: '20px', padding: '16px' }} />
                    <Legend verticalAlign="top" align="right" iconType="circle" height={70} wrapperStyle={{ fontSize: '22px', fontWeight: 'bold' }}/>
                    <Bar dataKey="income" name="收入" fill="#10b981" radius={[0, 15, 15, 0]} barSize={50} />
                    <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[0, 15, 15, 0]} barSize={50} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-500 uppercase tracking-wider mb-12">支出分类占比</h3>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={150}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)', fontSize: '20px', padding: '16px' }}/>
                    <Legend verticalAlign="bottom" height={60} iconType="circle" wrapperStyle={{ fontSize: '20px', fontWeight: 'bold', paddingTop: '32px' }} />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-500 uppercase tracking-wider mb-12">支出排行榜</h3>
            <div className="space-y-10">
              {expenseData.map((item, index) => {
                const percent = totalExpense > 0 ? (item.value / totalExpense * 100).toFixed(1) : '0.0';
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-bold shrink-0 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-gray-800">{item.name}</div>
                        <div className="w-40 bg-gray-100 h-4 rounded-full mt-4 overflow-hidden">
                           <div className="bg-brand-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-4xl font-bold text-gray-900">¥{item.value.toFixed(0)}</div>
                       <div className="text-2xl text-gray-400 mt-2">{percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-32 text-gray-300 text-3xl font-medium">该时间段暂无数据</div>
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