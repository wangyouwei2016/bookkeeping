# 夫妻账本 (CoupleLedger) v1.0

一款专为夫妻二人设计的**大字版**、**极简**、**智能化**移动端记账 Web 应用。

它拥有超大的字体和按钮设计（适老模式），支持 AI 语音智能记账，利用 Supabase 实现私有云端数据同步，通过 Vercel 部署实现开箱即用。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ 核心功能

### 1. 📱 极致的大屏/适老体验 (Senior Mode)
*   **超大字体与控件**：考虑到移动端操作的便捷性，所有金额、按钮、列表文字都经过了 200%~300% 的放大处理。
*   **防误触设计**：底部导航栏高达 160px，核心操作区域醒目，非常适合手指粗大或视力不佳的用户（以及需要在行进间快速记账的年轻人）。
*   **PWA 支持**：添加到主屏幕后，像原生 App 一样全屏运行。

### 2. 🤖 稳定的 AI 智能记账
*   **语音直录**：按住麦克风说话（例如：“刚才交了房租 8000 元”），系统会自动录音。
*   **后端代理转发**：内置 Vercel Serverless Proxy，**解决了国内手机无法直接连接 Google Gemini API 的问题**。
*   **智能解析**：AI 自动识别金额、日期、分类（如自动归类为“居住”）和备注。

### 3. 👫 双人协作模式
*   支持“丈夫”和“妻子”两种身份切换。
*   数据共存于一个账本，清晰记录每一笔消费的来源。
*   首页实时展示**月度结余**，时刻掌握家庭财政健康状况。

### 4. 📊 多维度统计
*   **趋势分析**：年度视图下展示“存钱趋势”曲线图。
*   **收支对比**：直观的条形图对比双方贡献。
*   **支出排行**：详细的分类支出占比和排行榜。

### 5. 🔒 数据私有化
*   基于 Supabase (PostgreSQL) 存储。
*   用户需在首次使用时配置自己的数据库 URL 和 Key，**数据完全掌握在自己手中**，开发者无法查看。

---

## 🚀 快速部署 (Vercel)

本项目专为 Vercel 部署优化，自带 API 代理功能。

### 1. 准备工作
1.  **Supabase**: 注册 [Supabase](https://supabase.com/)，创建一个项目。
2.  **Google Gemini**: 获取 [Gemini API Key](https://aistudio.google.com/app/apikey)。

### 2. 数据库初始化
在 Supabase 的 **SQL Editor** 中运行以下语句：

```sql
-- 1. 创建交易记录表
create table transactions (
  id uuid default gen_random_uuid() primary key,
  amount numeric not null,
  category text not null,
  type text not null, -- 'expense' or 'income'
  date text not null, -- YYYY-MM-DD
  note text,
  recorded_by text,   -- 'husband' or 'wife'
  created_at bigint   -- timestamp
);

-- 2. 开启行级安全 (RLS)
alter table transactions enable row level security;

-- 3. 创建访问策略 (允许所有拥有 Key 的人读写，适合家庭私用)
create policy "Enable all access for anon key" 
on transactions for all 
using (true) 
with check (true);
```

### 3. 一键部署
将代码 Fork 到你的 GitHub，然后在 Vercel 中导入。

**必须配置的环境变量 (Environment Variables):**

| 变量名 | 说明 |
| :--- | :--- |
| `VITE_API_KEY` | **Google Gemini API Key** (用于 AI 功能) |

> **注意**: `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 可以选择性配置。如果不配置，用户在首次打开网页时，会看到一个漂亮的配置界面，手动输入这些信息（信息仅保存在用户浏览器的 LocalStorage 中）。

---

## 🛠️ 技术架构

*   **前端框架**: React 19 + Vite
*   **UI 库**: Tailwind CSS (大量使用了自定义的大尺寸布局)
*   **图表**: Recharts
*   **后端服务**: Vercel Serverless Functions (`/api/proxy.js`)
*   **数据库**: Supabase (PostgreSQL)
*   **AI 模型**: Google Gemini 2.5 Flash

## 📝 版本历史

查看 [RELEASE_NOTES.md](./RELEASE_NOTES.md) 了解详细更新记录。

---

*Made with ❤️ for my family.*