
export type TransactionType = 'income' | 'expense';

export enum MainCategory {
  INCOME = 'Pemasukan',
  MORTGAGE = 'Angsuran KPR',
  DAILY = 'Kebutuhan Harian',
  EMERGENCY = 'Dana Darurat',
  INVESTMENT = 'Investasi',
  SOCIAL = 'Dana Sosial/Cadangan'
}

export type SubCategory =
  | 'Iuran & Air' | 'Internet' | 'Listrik' | 'Bensin' | 'Pulsa' | 'Makan' | 'Dan lain2'
  | 'Saham' | 'Reksadana' | 'Kripto' | 'Deposito'
  | 'None';

export interface Transaction {
  id: string;
  type: TransactionType;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  amount: number;
  createdAt: string;
  description: string;
}

export interface User {
  email: string;
  password: string;
  isAuthenticated: boolean;
}

export interface Angsuran {
  id: string;
  bulan: number;
  jumlah: number;
  bunga: number;
  pokok: number;
  sisaPinjaman: number;
  jatuhTempo: string;
  status: 'terbayar' | 'belum_terbayar';
}

export interface Pinjaman {
  id: string;
  jumlahPinjaman: number;
  bungaTahunan: number;
  tenorBulan: number;
  tanggalPinjaman: string;
  angsuran: Angsuran[];
}
