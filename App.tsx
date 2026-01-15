import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import TransactionList from './components/TransactionList';
import VoiceRecordingModal from './components/VoiceRecordingModal';
import { Transaction, UserType, TransactionType, CATEGORIES } from './types';
import { parseTransactionWithGemini, transcribeAudioWithGemini } from './services/geminiService';
import { getSupabase, saveSupabaseConfig, clearSupabaseConfig, testConnection, getStoredConfig, initSupabase } from './services/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts';
import { Mic, Send, Sparkles, Loader2, User as UserIcon, Calendar, Tag, FileText, LogOut, Database, Settings, AlertCircle, CloudCog, Globe, Key, ChevronRight, ChevronDown, Coffee, ShoppingBag, Receipt, Car, Home, Film, ShieldCheck, DollarSign, Activity, Briefcase, GraduationCap, Baby, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col p-3 sm:p-4 font-sans overflow-y-auto relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-brand-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute top-[40%] left-[20%] w-[40%] h-[20%] bg-white rounded-full blur-[80px] opacity-60"></div>
       </div>

      {/* Header Area */}
      <div className="mt-4 sm:mt-6 mb-4 sm:mb-6 px-3 sm:px-4 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-600 mb-3 sm:mb-4 shadow-lg shadow-brand-100 ring-2 ring-white/50">
           <Database className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 sm:mb-3 leading-tight">
          私有数据库<br/>连接配置
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed">
          可以使用您自己的数据库<br/>保证数据的绝对私密性
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl shadow-brand-900/5 border border-white mb-4 sm:mb-5 relative z-10">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold mb-4 sm:mb-5 flex items-start gap-2 text-left border border-red-100 animate-in fade-in">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5" />
              <span className="break-all leading-normal">{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
            <div className="space-y-2 sm:space-y-2.5">
              <label className="block text-sm sm:text-base font-bold text-gray-700 ml-1 sm:ml-2">Project URL</label>
              <div className="relative group">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-3 sm:pr-4 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              <label className="block text-sm sm:text-base font-bold text-gray-700 ml-1 sm:ml-2">Anon Public Key</label>
              <div className="relative group">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-brand-500 transition-colors">
                  <Key className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <input 
                  type="password" 
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="eyJxh..."
                  className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-3 sm:pr-4 bg-gray-50/80 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-gray-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder-gray-300 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isTesting}
              className="w-full h-12 sm:h-14 mt-3 sm:mt-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl sm:rounded-2xl font-bold shadow-2xl shadow-brand-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  <span>连接中...</span>
                </>
              ) : (
                <>
                  <span>确认连接</span>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
                </>
              )}
            </button>
            
          </form>
      </div>

      <div className="text-center px-3 sm:px-4 pb-4 sm:pb-5 relative z-10">
          <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed">
            首次使用请确保已在 Supabase SQL Editor 中创建了 <span className="font-bold text-brand-700 font-mono">transactions</span> 表
          </p>
      </div>
    </div>
  );
};

// 0. LOGIN / IDENTITY SELECTION SCREEN
const LoginScreen = ({ onLogin, onResetConfig }: { onLogin: (user: UserType) => void, onResetConfig: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-pink-200 rounded-full blur-[100px]"></div>
      </div>

      <button 
        onClick={() => { if(confirm('确定要清除数据库配置吗？')) onResetConfig(); }}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-4 sm:p-6 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform z-10"
      >
        <Settings className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>

      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-brand-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-brand-200 mb-6 sm:mb-10 rotate-3 z-10">
        <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-5 z-10 tracking-tight">家庭账本</h1>
      <p className="text-gray-500 mb-8 sm:mb-12 text-lg sm:text-xl md:text-2xl z-10 font-medium">请选择您的身份</p>

      <div className="space-y-4 sm:space-y-6 w-full max-w-md sm:max-w-lg z-10">
        <button
          onClick={() => onLogin('husband')}
          className="w-full py-5 sm:py-6 bg-white hover:bg-blue-50 border-4 border-white hover:border-blue-100 text-gray-800 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center gap-3 sm:gap-5 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl">我是为</span>
        </button>

        <button
          onClick={() => onLogin('wife')}
          className="w-full py-5 sm:py-6 bg-white hover:bg-pink-50 border-4 border-white hover:border-pink-100 text-gray-800 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center gap-3 sm:gap-5 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl">我是娜</span>
        </button>

        <button
          onClick={() => onLogin('xi')}
          className="w-full py-5 sm:py-6 bg-white hover:bg-purple-50 border-4 border-white hover:border-purple-100 text-gray-800 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center gap-3 sm:gap-5 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <span className="font-bold text-xl sm:text-2xl md:text-3xl">我是熙</span>
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
    const d = parseLocalDate(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const monthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  
  // Requirement: Main balance shows "Monthly Balance" instead of Total
  const monthBalance = monthIncome - monthExpense;

  // --- Pagination Logic (Client Side Windowing) ---
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Reset pagination when transaction list drastically changes (optional, but good for refresh)
  // But strictly we want to keep it simple.
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };
  
  const visibleTransactions = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-10 md:space-y-12">
      <header className="flex justify-between items-center pt-4 sm:pt-6">
        <div>
           <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium">
             当前身份: <span className="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl sm:rounded-2xl">{currentUser === 'husband' ? '为' : currentUser === 'wife' ? '娜' : '熙'}</span>
           </p>
        </div>
        <button onClick={onChangeUser} className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 text-gray-400 hover:text-brand-600 active:scale-95 transition-all">
          <LogOut className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </header>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-600 rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl shadow-brand-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="text-brand-100 text-lg sm:text-xl md:text-2xl font-medium mb-3 sm:mb-4">本月结余</div>
          <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 sm:mb-8 md:mb-10 tracking-tight leading-none">
            {isLoading ? '...' : `¥${monthBalance.toFixed(0)}`}
          </div>
          
          <div className="flex gap-4 sm:gap-6 md:gap-8">
            <div className="flex-1 bg-white/10 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-sm sm:text-base md:text-lg font-medium mb-2">本月收入</div>
              <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-emerald-300">
                {isLoading ? '...' : `+${monthIncome.toFixed(0)}`}
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 backdrop-blur-sm border border-white/10">
              <div className="text-brand-100 text-sm sm:text-base md:text-lg font-medium mb-2">本月支出</div>
              <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-rose-300">
                {isLoading ? '...' : `-${monthExpense.toFixed(0)}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-4">
          最近明细
          {isLoading && <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-gray-400" />}
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

// Helper function to get local date string without timezone conversion
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to parse date string as local date
const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// 2. ADD TRANSACTION PAGE
const AddTransaction = ({ onAdd, currentUser, isSaving }: { onAdd: (t: Transaction) => void, currentUser: UserType, isSaving: boolean }) => {
  const [activeUser, setActiveUser] = useState<UserType>(currentUser);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  
  const [smartInput, setSmartInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setActiveUser(currentUser);
  }, [currentUser]);

  // Helper to determine supported audio mime type for the device
  const getSupportedMimeType = () => {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4', // iOS Safari 14.5+
        'audio/aac',
        'audio/ogg'
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return ''; // Let the browser choose default if all checks fail
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
    // STOP RECORDING
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    // START RECORDING
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("您的浏览器不支持音频录制，或未授权麦克风");
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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());

        // Create Blob using the same mimeType we recorded with (or default)
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        
        if (audioBlob.size === 0) {
            alert("录音失败，没有捕获到音频数据");
            return;
        }

        // Processing...
        setIsAnalyzing(true); 
        
        // Convert Blob to Base64 for Gemini
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
                } else {
                   alert("未能识别出语音内容。请检查网络是否正常，或确认 API Key 配置正确。");
                }
             }
           } catch(e) {
             console.error(e);
             alert("语音识别服务出错，请稍后重试");
           } finally {
             setIsAnalyzing(false);
           }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Mic Error:", err);
      alert("无法访问麦克风，请检查是否在系统设置中禁用了权限，或者尝试使用 HTTPS 访问。");
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
    <>
      {/* Voice Recording Modal */}
      <VoiceRecordingModal 
        isRecording={isRecording}
        isAnalyzing={isAnalyzing}
        onCancel={toggleListening}
      />

      <div className="p-6 pb-48">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 pt-4">记一笔</h2>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-3 h-full bg-brand-500"></div>
        <label className="text-2xl font-bold text-brand-600 uppercase tracking-wider mb-5 block flex items-center gap-3">
          <Sparkles size={28} /> AI 智能记账
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder="例如：买菜200"
            className="flex-1 bg-gray-50 border-none rounded-2xl text-xl px-6 py-5 focus:ring-4 focus:ring-brand-200"
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`p-5 rounded-2xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Mic size={32} />
          </button>
          <button
            type="button"
            onClick={handleSmartParse}
            disabled={isAnalyzing || !smartInput}
            className="p-5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={32} className="animate-spin" /> : <Send size={32} />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
           <span className="text-xl text-gray-500 font-bold shrink-0">记账人:</span>
           <div className="flex gap-4 flex-1">
             <button
               type="button"
               onClick={() => setActiveUser('husband')}
               className={`flex-1 py-4 rounded-2xl text-xl font-bold transition-colors ${
                 activeUser === 'husband' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               为
             </button>
             <button
               type="button"
               onClick={() => setActiveUser('wife')}
               className={`flex-1 py-4 rounded-2xl text-xl font-bold transition-colors ${
                 activeUser === 'wife' ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               娜
             </button>
             <button
               type="button"
               onClick={() => setActiveUser('xi')}
               className={`flex-1 py-4 rounded-2xl text-xl font-bold transition-colors ${
                 activeUser === 'xi' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'
               }`}
             >
               熙
             </button>
           </div>
        </div>

        <div className="flex gap-6">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
              className={`flex-1 py-5 border-4 rounded-2xl font-bold text-2xl transition-all ${
                type === 'expense' ? 'border-accent-500 bg-accent-50 text-accent-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
              className={`flex-1 py-5 border-4 rounded-2xl font-bold text-2xl transition-all ${
                type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'
              }`}
            >
              收入
            </button>
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-500 mb-4 ml-3">金额</label>
          <div className="relative">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-5xl">¥</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-20 pr-8 py-10 text-6xl font-extrabold text-gray-800 bg-gray-50 rounded-3xl border-none focus:ring-8 focus:ring-brand-500/20 outline-none placeholder-gray-200 tracking-tight"
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xl font-bold text-gray-500 mb-4 flex items-center gap-2 ml-3"><Tag size={28}/> 分类</label>
            <div className="relative">
               <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-xl font-bold text-gray-800 focus:ring-4 focus:ring-brand-500 appearance-none shadow-sm"
              >
                {(type === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xl font-bold text-gray-500 mb-4 flex items-center gap-2 ml-3"><Calendar size={28}/> 日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-xl font-bold text-gray-800 focus:ring-4 focus:ring-brand-500 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-500 mb-4 flex items-center gap-2 ml-3"><FileText size={28}/> 备注 (选填)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这笔钱是干嘛的？"
            className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-xl text-gray-800 focus:ring-4 focus:ring-brand-500 shadow-sm placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-6 bg-gray-900 text-white rounded-3xl font-bold text-2xl shadow-xl shadow-gray-400/40 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-4 mt-8"
        >
          {isSaving && <Loader2 size={32} className="animate-spin" />}
          {isSaving ? '保存中...' : '保存记录'}
        </button>
      </form>
      </div>
    </>
  );
};

// 工具函数
const getCategoryIcon = (category: string) => {
  const size = 44;
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
  switch (user) {
    case 'husband': return '为';
    case 'wife': return '娜';
    case 'xi': return '熙';
    default: return '未知';
  }
};

// 3. STATS PAGE
const Stats = ({ transactions }: { transactions: Transaction[] }) => {
  const [timeFilter, setTimeFilter] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'husband' | 'wife' | 'xi'>('all');

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const isYearMatch = d.getFullYear() === selectedDate.getFullYear();
    if (timeFilter === 'year') return isYearMatch;
    return isYearMatch && d.getMonth() === selectedDate.getMonth();
  });

  // 辅助函数：获取特定分类的交易明细
  const getTransactionsByCategory = (category: string) => {
    return filteredTransactions
      .filter(t => t.type === 'expense' && t.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const expenseData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const found = acc.find(item => item.name === curr.category);
      if (found) found.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // Category expense by user filter
  const categoryExpenseData = categoryFilter === 'all' ? expenseData :
    filteredTransactions
      .filter(t => t.type === 'expense' && t.user === categoryFilter)
      .reduce((acc, curr) => {
        const found = acc.find(item => item.name === curr.category);
        if (found) found.value += curr.amount;
        else acc.push({ name: curr.category, value: curr.amount });
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value);

  // New logic: User Income vs Expense
  const userStatsMap: Record<string, { name: string; income: number; expense: number }> = {
    husband: { name: '为', income: 0, expense: 0 },
    wife: { name: '娜', income: 0, expense: 0 },
    xi: { name: '熙', income: 0, expense: 0 }
  };

  filteredTransactions.forEach(t => {
    const u = t.user as UserType;
    if (userStatsMap[u]) {
      if (t.type === 'income') {
         userStatsMap[u].income += t.amount;
      } else {
         userStatsMap[u].expense += t.amount;
      }
    }
  });

  const userStatsData = [userStatsMap.husband, userStatsMap.wife, userStatsMap.xi];

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

  // 当时间筛选变化时，重置展开状态
  useEffect(() => {
    setExpandedCategory(null);
  }, [timeFilter, selectedDate]);

  return (
    <div className="p-8 space-y-12 pb-48">
      <header className="flex justify-between items-center pt-6">
         <h2 className="text-4xl font-bold text-gray-800">统计报表</h2>
         <div className="flex bg-gray-100 p-3 rounded-2xl">
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-6 py-4 text-xl font-bold rounded-xl transition-all ${timeFilter === 'month' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              月度
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`px-6 py-4 text-xl font-bold rounded-xl transition-all ${timeFilter === 'year' ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
            >
              年度
            </button>
         </div>
      </header>

      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else newDate.setFullYear(newDate.getFullYear() - 1);
            setSelectedDate(newDate);
         }} className="p-5 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-2xl">{'<'}</button>

         <div className="font-bold text-3xl text-gray-800">
           {selectedDate.getFullYear()}年
           {timeFilter === 'month' && ` ${selectedDate.getMonth() + 1}月`}
         </div>

         <button onClick={() => {
            const newDate = new Date(selectedDate);
            if(timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else newDate.setFullYear(newDate.getFullYear() + 1);
            setSelectedDate(newDate);
         }} className="p-5 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform bg-gray-50 rounded-2xl">{'>'}</button>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
            <div className="text-xl text-emerald-600 mb-5 font-bold">总收入</div>
            <div className="text-4xl font-extrabold text-emerald-700">+{totalIncome.toFixed(0)}</div>
         </div>
         <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
            <div className="text-xl text-rose-600 mb-5 font-bold">总支出</div>
            <div className="text-4xl font-extrabold text-rose-700">-{totalExpense.toFixed(0)}</div>
         </div>
      </div>

      {/* Annual Trend Chart (Only for Year view) */}
      {timeFilter === 'year' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-wider mb-10">存钱趋势 (月度结余)</h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={annualTrendData} margin={{ left: 15, right: 35, top: 25, bottom: 15 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 18, fill: '#9ca3af', dy: 15}} />
                 <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                 <RechartsTooltip
                   formatter={(value: number) => `¥${value.toFixed(0)}`}
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 6px 16px -4px rgba(0, 0, 0, 0.1)', fontSize: '18px', padding: '16px' }}
                   labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '6px', fontSize: '16px' }}
                 />
                 <Line
                   type="monotone"
                   dataKey="balance"
                   name="结余"
                   stroke="#14b8a6"
                   strokeWidth={4}
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
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-wider mb-10">个人支出对比</h3>
            <div className="h-60 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={userStatsData} barGap={20} margin={{ left: 15, right: 60, top: 15, bottom: 15 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 18, fill: '#9ca3af'}} tickFormatter={(v) => `¥${v.toFixed(0)}`} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} style={{fontSize: '22px', fontWeight: 'bold'}} />
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 6px 16px -4px rgba(0, 0, 0, 0.1)', fontSize: '18px', padding: '16px' }} />
                    <Bar dataKey="expense" name="支出" radius={[0, 10, 10, 0]} barSize={50} label={{ position: 'right', fill: '#374151', fontSize: 18, fontWeight: 'bold', formatter: (v: number) => `¥${v.toFixed(0)}` }}>
                      {userStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#ec4899' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-wider">支出分类占比</h3>
              <div className="flex gap-3 bg-gray-100 p-2 rounded-2xl">
                {['all', 'husband', 'wife', 'xi'].map((key) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key as 'all' | 'husband' | 'wife' | 'xi')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      categoryFilter === key
                        ? key === 'all' ? 'bg-white text-brand-600 shadow' :
                          key === 'husband' ? 'bg-white text-blue-600 shadow' :
                          key === 'wife' ? 'bg-white text-pink-600 shadow' :
                          'bg-white text-purple-600 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {key === 'all' ? '全部' : key === 'husband' ? '为' : key === 'wife' ? '娜' : '熙'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryFilter === 'all' ? expenseData : categoryExpenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(categoryFilter === 'all' ? expenseData : categoryExpenseData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 6px 16px -4px rgba(0, 0, 0, 0.1)', fontSize: '18px', padding: '16px' }}/>
                    <Legend verticalAlign="bottom" height={50} iconType="circle" wrapperStyle={{ fontSize: '18px', fontWeight: 'bold', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-wider mb-10">支出排行榜</h3>
            <div className="space-y-8">
              {expenseData.map((item, index) => {
                const percent = totalExpense > 0 ? (item.value / totalExpense * 100).toFixed(1) : '0.0';
                const isExpanded = expandedCategory === item.name;
                const categoryTransactions = getTransactionsByCategory(item.name);

                return (
                  <div key={item.name} className="space-y-4">
                    {/* 主排行榜项 - 可点击展开 */}
                    <button
                      onClick={() => {
                        setExpandedCategory(isExpanded ? null : item.name);
                      }}
                      className="w-full flex items-center justify-between active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-200 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-50 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{item.name}</div>
                          <div className="w-32 bg-gray-100 h-3 rounded-full mt-3 overflow-hidden">
                             <div className="bg-brand-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-gray-900">¥{item.value.toFixed(0)}</div>
                         <div className="text-base text-gray-400 mt-1">{percent}%</div>
                      </div>
                      {/* 展开指示器 */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3"
                      >
                        <ChevronDown className="w-8 h-8 text-gray-400" />
                      </motion.div>
                    </button>

                    {/* 展开的明细区域 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 pl-14 space-y-3">
                            {/* 明细列表 */}
                            {categoryTransactions.length === 0 ? (
                              <div className="text-center py-6 text-gray-400 text-base">
                                该分类暂无支出记录
                              </div>
                            ) : (
                              categoryTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-white text-red-500">
                                      {getCategoryIcon(transaction.category)}
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-gray-800">{transaction.category}</div>
                                      <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <span>{formatDate(transaction.date)}</span>
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                          transaction.user === 'husband' ? 'bg-blue-50 text-blue-600' : transaction.user === 'wife' ? 'bg-pink-50 text-pink-600' : 'bg-purple-50 text-purple-600'
                                        }`}>
                                          {formatUser(transaction.user)}
                                        </span>
                                      </div>
                                      {transaction.note && (
                                        <div className="text-gray-400 text-sm mt-1 truncate max-w-[200px]">
                                          {transaction.note}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="font-bold text-xl text-gray-900">
                                    -{transaction.amount.toFixed(0)}
                                  </div>
                                </div>
                              ))
                            )}
                            {/* 总数显示 */}
                            {categoryTransactions.length > 0 && (
                              <div className="text-center text-gray-500 text-base pt-3">
                                共 {categoryTransactions.length} 笔交易
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 text-gray-300 text-2xl font-medium">该时间段暂无数据</div>
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