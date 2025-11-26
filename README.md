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
    *   无需复杂的后端部署，配置好 URL 和 Key 即可使用。
    *   支持多设备访问同一份账本数据。

4.  **多维度统计 (Analytics)**
    *   **收支概览**：首页卡片实时显示本月收支和家庭总积蓄。
    *   **饼图分析**：按类别（如餐饮、交通、教育）查看支出占比。
    *   **成员对比**：条形图直观展示夫妻双方的消费比例。
    *   **时间筛选**：支持按月度和年度切换查看报表。

## 🛠️ 技术栈

*   **前端**: React 19, Tailwind CSS, Lucide Icons, Recharts
*   **AI**: Google Gemini API (`gemini-2.5-flash`)
*   **后端/数据库**: Supabase (Backend-as-a-Service)

---

## 🚀 快速开始 & 部署指南

### 第一步：准备 Supabase 数据库

本项目使用 Supabase 作为云端数据库。请按照以下步骤操作：

1.  注册并登录 [Supabase](https://supabase.com/)。
2.  点击 **"New Project"** 创建一个新项目。
3.  项目创建完成后，进入左侧菜单的 **SQL Editor** (图标类似终端)。
4.  点击 **"New Query"**，将下方的 SQL 脚本复制进去并点击 **Run**：

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

-- 3. 创建访问策略 (允许拥有 Key 的应用读写所有数据)
-- 注意：对于家庭内部应用，这里配置为允许匿名 Key 读写所有数据
create policy "Enable all access for anon key" 
on transactions for all 
using (true) 
with check (true);
```

5.  建表成功后，去左侧菜单点击 **Project Settings** (齿轮图标) -> **API**。
6.  复制 **Project URL** 和 **anon public key**，稍后在 APP 中会用到。

### 第二步：获取 Gemini API Key (用于智能记账)

1.  访问 [Google AI Studio](https://aistudio.google.com/)。
2.  获取一个免费的 API Key。
3.  **注意**：在本项目代码中，Gemini API Key 需要配置在环境变量中，或者你可以临时修改 `services/geminiService.ts` 代码进行测试。
    *   *如果在本地开发环境中运行，请确保 `.env` 文件包含 `API_KEY`。*
    *   *如果是纯前端部署，确保你的构建环境注入了该变量。*

### 第三步：启动应用

首次打开应用时：

1.  界面会提示 **"连接云端账本"**。
2.  填入第一步中获取的 Supabase **Project URL** 和 **Anon Public Key**。
3.  点击连接，系统会自动验证数据库连通性。
4.  验证通过后，选择你的身份（丈夫/妻子），即可开始记账。

---

## 📖 使用说明

### 1. 记账 (Add)
*   **手动记账**：点击底部中间的 "+" 号，选择支出/收入、分类、金额、日期和备注。
*   **AI 记账**：
    1.  在记账页面顶部的输入框输入文字，或点击麦克风图标说话。
    2.  例子：“今天晚上请客吃饭花了500”，“发工资了20000”。
    3.  点击发送图标，AI 会自动填好下方的表单，确认无误后点击保存。

### 2. 查看明细 (Home)
*   首页显示当前家庭总余额、本月收入和支出。
*   下方列出最近的交易记录。
*   点击右上角的“退出”图标可以切换用户身份。

### 3. 统计报表 (Stats)
*   点击底部右侧“统计”。
*   切换“月度”或“年度”查看不同时间跨度的消费情况。
*   查看支出分类饼图，了解钱都花哪儿了。
*   查看贡献对比图，了解谁是“败家子”或“养家侠”。

---

## 🔒 数据安全说明

*   所有数据存储在您自己的 Supabase 数据库中，开发者无法访问您的数据。
*   应用的配置信息（数据库 URL/Key）仅保存在您浏览器的 LocalStorage 中。
