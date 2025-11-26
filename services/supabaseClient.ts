
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

let supabaseInstance: SupabaseClient | null = null;

// 安全获取环境变量
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // ignore
  }
  return undefined;
};

export const getStoredConfig = () => {
  // 1. 优先读取 config.ts (代码硬编码)
  if (APP_CONFIG.SUPABASE_URL && APP_CONFIG.SUPABASE_ANON_KEY) {
    return {
      url: APP_CONFIG.SUPABASE_URL.trim(),
      key: APP_CONFIG.SUPABASE_ANON_KEY.trim()
    };
  }

  // 2. 其次读取 LocalStorage (浏览器缓存)
  const localUrl = localStorage.getItem('coupleLedger_sb_url');
  const localKey = localStorage.getItem('coupleLedger_sb_key');
  
  if (localUrl && localKey) {
    return {
      url: localUrl.trim(),
      key: localKey.trim()
    };
  }

  // 3. 最后尝试读取环境变量 (构建时注入)
  return {
    url: (getEnv('SUPABASE_URL') || '').trim(),
    key: (getEnv('SUPABASE_ANON_KEY') || '').trim()
  };
};

// 初始化单例
export const initSupabase = (url: string, key: string) => {
  if (!url || !key) return null;
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (e) {
    console.error("Supabase init failed", e);
    return null;
  }
};

// 获取当前实例
export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // 如果尚未初始化，尝试使用存储的配置初始化
  const { url, key } = getStoredConfig();
  if (url && key) {
    return initSupabase(url, key);
  }
  return null;
};

// 测试连接有效性
export const testConnection = async (url: string, key: string) => {
  try {
    const tempClient = createClient(url, key);
    // 尝试查询数据条数，这需要 'transactions' 表存在
    const { count, error } = await tempClient
      .from('transactions')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    // 抛出具体的错误信息
    throw new Error(error.message || "连接验证失败，请检查 URL 和 Key");
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('coupleLedger_sb_url', url.trim());
  localStorage.setItem('coupleLedger_sb_key', key.trim());
  // 更新实例
  initSupabase(url, key);
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('coupleLedger_sb_url');
  localStorage.removeItem('coupleLedger_sb_key');
  supabaseInstance = null;
};
