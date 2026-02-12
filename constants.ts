
import { MainCategory, SubCategory } from './types';

export const CATEGORY_MAP: Record<MainCategory, SubCategory[]> = {
  [MainCategory.INCOME]: ['Pembayaran Hutang', 'Tabungan', 'Dan lain2'],
  [MainCategory.MORTGAGE]: ['None'],
  [MainCategory.DAILY]: ['Iuran & Air', 'Internet', 'Listrik', 'Bensin', 'Pulsa', 'Makan', 'Belanja Online', 'Dan lain2'],
  [MainCategory.EMERGENCY]: ['None'],
  [MainCategory.INVESTMENT]: ['Saham', 'Reksadana', 'Kripto', 'Deposito'],
  [MainCategory.SOCIAL]: ['None'],
  [MainCategory.LOAN]: ['Pinjaman Online', 'Pinjaman Pribadi', 'Pinjaman Bank', 'Cicilan Kartu Kredit']
};

export const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  primary: '#6366f1',
  chart: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
};
