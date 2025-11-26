
export type TransactionType = 'expense' | 'income';

export type UserType = 'husband' | 'wife';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO String YYYY-MM-DD
  note: string;
  user: UserType;
  createdAt: number;
}

export const CATEGORIES = {
  expense: [
    '餐饮',
    '交通',
    '购物',
    '娱乐',
    '居住',
    '医疗',
    '旅行',
    '教育',
    '育儿',
    '其他'
  ],
  income: [
    '工资',
    '奖金',
    '理财',
    '红包',
    '其他'
  ]
};

export interface GeminiParseResult {
  amount?: number;
  category?: string;
  type?: TransactionType;
  date?: string; // YYYY-MM-DD
  note?: string;
}