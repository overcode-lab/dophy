export interface ProductInfo {
  id?: string;
  name: string;
  price: number;
  weight?: string;
  category?: string;
}

export interface AffiliateInfo {
  id?: string;
  full_name: string;
  email: string;
  referral_code: string;
  phone_number?: string;
}

export interface SaleItem {
  id: string;
  product_id?: string;
  affiliate_id?: string;
  quantity: number;
  total_price: number;
  commission_amount: number;
  referral_code?: string;
  transaction_date: string;
  created_at?: string;
  products?: ProductInfo;
  affiliates?: AffiliateInfo;
}

export interface DateState {
  day: number;
  month: number;
  year: number;
}

export type QuickDatePreset =
  | "today"
  | "yesterday"
  | "3days"
  | "7days"
  | "14days"
  | "30days";

export type DateFilterType = "all" | QuickDatePreset | "specific" | "range";

export interface QuickDateOption {
  id: QuickDatePreset;
  label: string;
  badge?: string;
}

export const QUICK_DATE_OPTIONS: QuickDateOption[] = [
  { id: "today", label: "Hari Ini" },
  { id: "yesterday", label: "Kemarin" },
  { id: "3days", label: "3 Hari Terakhir" },
  { id: "7days", label: "Seminggu Terakhir" },
  { id: "14days", label: "2 Minggu Terakhir" },
  { id: "30days", label: "Sebulan Terakhir" },
];

export interface FilterState {
  dateType: DateFilterType;
  specificDate: DateState | null;
  rangeStartDate: DateState | null;
  rangeEndDate: DateState | null;
  selectedProduct: string;
  selectedReferral: string;
}

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
