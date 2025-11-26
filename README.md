# 夫妻账本 (CoupleLedger)

一款专为夫妻二人设计的极简、现代化移动端记账 Web 应用。支持 AI 语音/文本智能记账、多维度统计分析，并利用 Supabase 实现云端数据同步。

## ✨ 核心功能

1.  **双人模式 (Dual Identity)**
    *   支持“丈夫”和“妻子”两种身份切换。
    *   数据共存于一个账本，但会记录每一笔账是由谁消费/记录的。
    *   统计图表中可清晰对比双方的消费贡献。

2.  **AI 智能记账 (Smart Entry)**
    *   **自然语言解析**：集成 Google Gemini AI。
    *   **支持语音输入**：直接点击麦克风说话，例如：“昨天给宝宝买奶粉花了300元”。
    *   **自动分类**：AI 会自动提取金额、日期，并根据上下文匹配到“育儿”、“餐饮”等分类。

3.  **云端同步 (Cloud Sync)**
    *   基于 Supabase (PostgreSQL) 存储。
    *   **免配置模式**：通过 Vercel 环境变量注入配置，打开即用，无需手动输入 URL 和 Key。
    *   支持多设备访问同一份账本数据。

4.  **多维度统计 (Analytics)**
    *   **收支概览**：首页卡片实时显示本月收支和家庭总积蓄。
    *   **饼图分析**：按类别（如餐饮、交通、教育）查看支出占比。
    *   **收支对比**：条形图直观展示夫妻双方的收入与支出情况。
    *   **时间筛选**：支持按月度和年度切换查看报表。

## 🛠️ 技术栈

*   **前端**: React 19, Tailwind CSS, Lucide Icons, Recharts, Vite
*   **AI**: Google Gemini API (`gemini-2.5-flash`)
*   **后端/数据库**: Supabase (Backend-as-a-Service)

---

## 🚀 数据库初始化 (Supabase)

在使用前，您需要先在 Supabase 中创建数据库表。

1.  登录 [Supabase](https://supabase.com/) 并创建一个新项目。
2.  进入 **SQL Editor**，运行以下 SQL 语句：

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

-- 3. 创建访问策略 (允许匿名读写，适合家庭内部使用)
create policy "Enable all access for anon key" 
on transactions for all 
using (true) 
with check (true);
```

3.  创建完成后，进入 **Project Settings** -> **API**，记下 `Project URL` 和 `anon public key`。

---

## ☁️ Vercel 部署与自动配置指南 (推荐)

为了获得最佳体验（无需每次打开都输入数据库信息），请在 Vercel 部署时配置环境变量。

### 1. 部署代码
将代码推送到 GitHub，然后在 Vercel 中导入该项目。

### 2. 配置环境变量 (Environment Variables)
在 Vercel 项目控制台中，点击 **Settings** -> **Environment Variables**，添加以下三个变量：

| 变量名 (Name) | 说明 (Value) | 作用 |
| :--- | :--- | :--- |
| `VITE_API_KEY` | **Google Gemini API Key** | 用于 AI 智能记账功能。 |
| `VITE_SUPABASE_URL` | **Supabase Project URL** | 数据库连接地址。 |
| `VITE_SUPABASE_ANON_KEY` | **Supabase Anon Public Key** | 数据库访问密钥。 |

> **注意**：变量名必须以 `VITE_` 开头，否则前端代码无法读取。

### 3. 重新部署 (Redeploy)
添加完环境变量后，去 **Deployments** 页面，点击最新的部署记录右侧的三个点，选择 **Redeploy**。

**部署完成后，打开网站将直接进入登录页（选择丈夫/妻子），无需再手动配置数据库连接！**

---

## 📖 使用说明

### 1. 记账 (Add)
*   **手动记账**：点击底部中间的 "+" 号，选择支出/收入、分类、金额、日期和备注。
*   **AI 记账**：
    1.  点击顶部麦克风说话，或输入文字。
    2.  例子：“今天发工资两万五”，“刚交了下季度房租8000”。
    3.  点击发送，AI 自动填单，确认后保存。

### 2. 统计 (Stats)
*   点击底部右侧“统计”。
*   查看月度/年度收支报表。
*   **收支情况图**：绿色代表收入，红色代表支出，左右对比一目了然。

---

## 🔒 数据安全说明

*   所有数据存储在您私有的 Supabase 数据库中。
*   Vercel 环境变量是在构建时注入到代码中的，只有访问该网站的人能通过浏览器查看（但可以通过 Supabase 的域名白名单进一步限制）。
