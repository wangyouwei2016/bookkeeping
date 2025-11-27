import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import TransactionList from './components/TransactionList';
import { Transaction, UserType, TransactionType, CATEGORIES } from './types';
import { parseTransactionWithGemini, transcribeAudioWithGemini } from './services/geminiService';
import { getSupabase, saveSupabaseConfig, clearSupabaseConfig, testConnection, getStoredConfig, initSupabase } from './services/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts';
import { Mic, Send, Sparkles, Loader2, User as UserIcon, Calendar, Tag, FileText, LogOut, Database, Settings, AlertCircle, CloudCog, Globe, Key, ChevronRight } from 'lucide-react';

// --- Components ---

// -1. CONFIG SCREEN
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
      await testConnection(url, key);
      saveSupabaseConfig(url, key);
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
        msg = "连接成功，但找不到 'transactions' 表。请建表。";
      } else if (msg.includes("fetch")) {
        msg = "网络连接失败，请检查 URL 是否正确";
      }
      setError(msg);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col p-6 font-sans overflow-y-auto relative overflow-hidden">
       <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-brand-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-40"></div>
       </div>

      <div className="mt-12 mb-8 px-2 relative z-10 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-600 mb-6 shadow-lg shadow-brand-100 ring-4 ring-white/50 mx-auto">
           <Database size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          私有账本配置
        </h1>
        <p className="text-sm text-gray-600 font-medium">
          连接您的 Supabase 数据库
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-brand-900/5 border border-white mb-6 relative z-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-start gap-3 text-left border border-red-100 animate-in fade-in">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="break-all">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 ml-2">Project URL</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Globe size={20} />
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full h-14 pl-12 pr-4 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl text-base font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 ml-2">Anon Public Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Key size={20} />
                </div>
                <input 
                  type="password" 
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="eyJxh..."
                  className="w-full h-14 pl-12 pr-4 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl text-base font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isTesting}
              className="w-full h-14 mt-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold shadow-xl shadow-brand-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-lg"
            >
              {isTesting ? <Loader2 size={24} className="animate-spin" /> : <span className="flex items-center gap-2">确认连接 <ChevronRight size={20} /></span>}
            </button>
            
          </form>
      </div>
    </div>
  );
};

// 0. LOGIN SCREEN
const LoginScreen = ({ onLogin, onResetConfig }: { onLogin: (user: UserType) => void, onResetConfig: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-pink-200 rounded-full blur-[100px]"></div>
      </div>

      <button 
        onClick={() => { if(confirm('确定要清除数据库配置吗？')) onResetConfig(); }}
        className="absolute top-6 right-6 p-4 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform z-10"
      >
        <Settings size={28} />
      </button>

      <div className="w-24 h-24 bg-brand-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-200 mb-8 rotate-3 z-10">
        <Sparkles size={48} className="text-white" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4 z-10 tracking-tight">夫妻账本</h1>
      <p className="text-gray-500 mb-12 text-lg z-10 font-medium">请选择您的身份</p>
      
      <div className="space-y-6 w-full max-w-sm z-10">
        <button 
          onClick={() => onLogin('husband')}
          className="w-full py-5 bg-white hover:bg-blue-50 border-4 border-white hover:border-blue-100 text-gray-800 rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserIcon size={24} />
          </div>
          <span className="font-bold text-xl">我是丈夫</span>
        </button>
        
        <button 
          onClick={() => onLogin('wife')}
          className="w-full py-5 bg-white hover:bg-pink-50 border-4 border-white hover:border-pink-100 text-gray-800 rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
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
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const monthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  const [visibleCount, setVisibleCount] = useState(10);
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };
  
  const visibleTransactions = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  return (
    <div className="p-5 space-y-6">
      <header className="flex justify-between items-center pt-2">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">夫妻账本</h1>
           <p className="text-sm text-gray-500 mt-1 font-medium">
             当前: <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">{currentUser === 'husband' ? '丈夫' : '妻子'}</span>
           </p>
        </div>
        <button onClick={onChangeUser} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-brand-600 active:scale-95 transition-all">
          <LogOut size={20} />
        </button>
      </header>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="text-brand-100 text-sm font-medium mb-2">本月结余</div>
          <div className="text-6xl font-extrabold mb-8 tracking-tight leading-none">
            {isLoading ? '...' : <><span className="text-4xl align-top opacity-80">¥</span>{monthBalance.toFixed(0)}</>}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-xs font-medium mb-1">本月收入</div>
              <div className="font-bold text-xl text-emerald-300">
                {isLoading ? '...' : `+${monthIncome.toFixed(0)}`}
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-xs font-medium mb-1">本月支出</div>
              <div className="font-bold text-xl text-rose-300">
                {isLoading ? '...' : `-${monthExpense.toFixed(0)}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          最近明细
          {isLoading && <Loader2 size={20} className="animate-spin text-gray-400" />}
        </h2>
        
        <TransactionList 
          transactions={visibleTransactions} 
          onDelete={onDelete} 
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
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
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setActiveUser(currentUser);
  }, [currentUser]);

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg'];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

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

  const toggleListening = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("您的浏览器不支持音频录制");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        if (audioBlob.size === 0) { alert("录音失败"); return; }
        setIsAnalyzing(true); 
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
           try {
             if (typeof reader.result === 'string') {
                const base64String = reader.result.split(',')[1];
                const text = await transcribeAudioWithGemini(base64String, finalMimeType);
                if (text) {
                  const cleanText = text.trim().replace(/[。，！？\.]$/, '');
                  setSmartInput(prev => prev ? prev + ' ' + cleanText : cleanText);
                } else { alert("未能识别出语音内容"); }
             }
           } catch(e) { console.error(e); alert("语音识别服务出错"); } 
           finally { setIsAnalyzing(false); }
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("无法访问麦克风");
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
    setAmount('');
    setNote('');
    setSmartInput('');
  };

  return (
    <div className="p-6 pb-32">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 pt-2">记一笔</h2>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>
        <label className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3 block flex items-center gap-2">
          <Sparkles size={16} /> AI 智能记账
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="例如：买菜200"
            className="flex-1 bg-gray-50 border-none rounded-2xl text-lg px-4 py-3 focus:ring-2 focus:ring-brand-200"
          />
          <button 
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Mic size={24} />
          </button>
          <button 
            type="button"
            onClick={handleSmartParse}
            disabled={isAnalyzing || !smartInput}
            className="p-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200">
           <span className="text-base text-gray-500 font-bold shrink-0">记账人:</span>
           <div className="flex gap-3 flex-1">
             <button
               type="button"
               onClick={() => setActiveUser('husband')}
               className={`flex-1 py-3 rounded-xl text-lg font-bold transition-colors ${
                 activeUser === 'husband' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               丈夫
             </button>
             <button
               type="button"
               onClick={() => setActiveUser('wife')}
               className={`flex-1 py-3 rounded-xl text-lg font-bold transition-colors ${
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
              className={`flex-1 py-4 border-2 rounded-2xl font-bold text-xl transition-all ${
                type === 'expense' ? 'border-accent-500 bg-accent-50 text-accent-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 py-4 border-2 rounded-2xl font-bold text-xl transition-all ${
                type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              收入
            </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 ml-2">金额</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-4xl">¥</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-14 pr-6 py-8 text-6xl font-extrabold text-gray-800 bg-gray-50 rounded-3xl border-none focus:ring-4 focus:ring-brand-500/20 outline-none placeholder-gray-200 tracking-tight"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 ml-2 flex items-center gap-1"><Tag size={16}/> 分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg font-bold text-gray-800 focus:ring-2 focus:ring-brand-500 appearance-none shadow-sm h-14"
            >
              {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2 ml-2 flex items-center gap-1"><Calendar size={16}/> 日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg font-bold text-gray-800 focus:ring-2 focus:ring-brand-500 shadow-sm h-14"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 ml-2 flex items-center gap-1"><FileText size={16}/> 备注 (选填)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这笔钱是干嘛的？"
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg text-gray-800 focus:ring-2 focus:ring-brand-500 shadow-sm placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-5 bg-gray-900 text-white rounded-3xl font-bold text-xl shadow-lg shadow-gray-400/40 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 mt-8"
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

  const userStatsMap = {
    husband: { name: '丈夫', income: 0, expense: 0 },
    wife: { name: '妻子', income: 0, expense: 0 }
  };

  filteredTransactions.forEach(t => {
    const u = t.user as 'husband' | 'wife';
    if (userStatsMap[u]) {
      if (t.type === 'income') userStatsMap[u].income += t.amount;
      else userStatsMap[u].expense += t.amount;
    }
  });
  
  const userStatsData = [userStatsMap.husband, userStatsMap.wife];
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  let annualTrendData: { name: string; balance: number }[] = [];
  if (timeFilter === 'year') {
    annualTrendData = Array.from({ length: 12 }, (_, i) => {
      const monthTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === i;
      });
      const mInc = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const mExp = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { name: `${i + 1}月`, balance: mInc - mExp };
    });
  }

  const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];
  
  return (
    <div className="p-6 space-y-6 pb-32">
      <header className="flex justify-between items-center pt-2">
         <h2 className="text-3xl font-bold text-gray-800">统计报表</h2>
         <div className="flex bg-gray-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${timeFilter === 'month' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              月度
            </button>
            <button 
              onClick={() => setTimeFilter('year')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${timeFilter === 'year' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              年度
            </button>
         </div>
      </header>

      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else newDate.setFullYear(newDate.getFullYear() - 1);
            setSelectedDate(newDate);
         }} className="p-3 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-2xl">{'<'}</button>
         
         <div className="font-bold text-xl text-gray-800">
           {selectedDate.getFullYear()}年
           {timeFilter === 'month' && ` ${selectedDate.getMonth() + 1}月`}
         </div>

         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else newDate.setFullYear(newDate.getFullYear() + 1);
            setSelectedDate(newDate);
         }} className="p-3 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-2xl">{'>'}</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
            <div className="text-sm text-emerald-600 mb-2 font-bold">总收入</div>
            <div className="text-2xl font-extrabold text-emerald-700">+{totalIncome.toFixed(0)}</div>
         </div>
         <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100">
            <div className="text-sm text-rose-600 mb-2 font-bold">总支出</div>
            <div className="text-2xl font-extrabold text-rose-700">-{totalExpense.toFixed(0)}</div>
         </div>
      </div>

      {timeFilter === 'year' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">存钱趋势 (月度结余)</h3>
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={annualTrendData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', dy: 10}} />
                 <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                 <RechartsTooltip 
                   formatter={(value: number) => `¥${value.toFixed(0)}`}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', padding: '8px' }}
                 />
                 <Line type="monotone" dataKey="balance" name="结余" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {(expenseData.length > 0 || totalIncome > 0) ? (
        <>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">收支对比</h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={userStatsData} barGap={8} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={40} style={{fontSize: '14px', fontWeight: 'bold'}} />
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(0)}`} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', padding: '8px' }} />
                    <Legend verticalAlign="top" align="right" iconType="circle" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                    <Bar dataKey="income" name="收入" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
                    <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">支出分类占比</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(0)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px', padding: '8px' }}/>
                    <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '16px' }} />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">支出排行榜</h3>
            <div className="space-y-5">
              {expenseData.map((item, index) => {
                const percent = totalExpense > 0 ? (item.value / totalExpense * 100).toFixed(1) : '0.0';
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-800">{item.name}</div>
                        <div className="w-24 bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                           <div className="bg-brand-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-bold text-gray-900">¥{item.value.toFixed(0)}</div>
                       <div className="text-sm text-gray-400 mt-1">{percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-300 text-lg font-medium">该时间段暂无数据</div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    return localStorage.getItem('coupleLedger_currentUser') as UserType | null;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'stats'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (client) {
      setSupabaseClient(client);
    }
  }, []);

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

  if (!supabaseClient) return <ConfigScreen onConfigSuccess={setSupabaseClient} />;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} onResetConfig={handleResetConfig} />;

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