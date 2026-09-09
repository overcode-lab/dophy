import { z } from "zod";

// ==========================================
// 1. ADMIN SCHEMA
// ==========================================
export const AdminSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Admin = z.infer<typeof AdminSchema>;

// ==========================================
// 2. AFFILIATE SCHEMA
// ==========================================
export const AffiliateStatusEnum = z.enum(["active", "inactive"]);

export const AffiliateRegisterSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bank_account_number: z.string().min(3, "Bank account number is required"),
  bank_name: z.string().min(2, "Bank / E-Wallet name is required"),
});

export const AffiliateSchema = AffiliateRegisterSchema.extend({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  referral_code: z.string().min(3),
  status: AffiliateStatusEnum.default("active"),
  available_balance: z.number().nonnegative().default(0),
  held_balance: z.number().nonnegative().default(0),
  sales_target: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Affiliate = z.infer<typeof AffiliateSchema>;
export type AffiliateRegisterInput = z.infer<typeof AffiliateRegisterSchema>;

// ==========================================
// 3. PRODUCT SCHEMA
// ==========================================
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Product name is required"),
  weight: z.string().default("65 gr"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

// ==========================================
// 4. SALE (TRANSACTION) SCHEMA
// ==========================================
export const SaleInputSchema = z.object({
  product_id: z.string().uuid("Please select a valid product"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  referral_code: z.string().optional().nullable(),
  transaction_date: z.string().optional(),
});

export const SaleSchema = SaleInputSchema.extend({
  id: z.string().uuid().optional(),
  total_price: z.number().nonnegative(),
  affiliate_id: z.string().uuid().nullable().optional(),
  commission_amount: z.number().nonnegative(),
  recorded_by_admin_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
});
export type Sale = z.infer<typeof SaleSchema>;
export type SaleInput = z.infer<typeof SaleInputSchema>;

// ==========================================
// 5. COMMISSION SCHEMA
// ==========================================
export const CommissionStatusEnum = z.enum(["calculated", "withdrawn"]);

export const CommissionSchema = z.object({
  id: z.string().uuid().optional(),
  affiliate_id: z.string().uuid(),
  sale_id: z.string().uuid(),
  amount: z.number().nonnegative(),
  status: CommissionStatusEnum.default("calculated"),
  created_at: z.string().optional(),
});
export type Commission = z.infer<typeof CommissionSchema>;

// ==========================================
// 6. WITHDRAWAL SCHEMA
// ==========================================
export const WithdrawalStatusEnum = z.enum(["pending", "processing", "completed", "rejected"]);

export const WithdrawalInputSchema = z.object({
  amount: z.number().positive("Withdrawal amount must be greater than 0"),
  bank_account_number: z.string().min(3, "Target bank account number is required"),
  bank_name: z.string().min(2, "Target bank / E-Wallet name is required"),
});

export const WithdrawalSchema = WithdrawalInputSchema.extend({
  id: z.string().uuid().optional(),
  affiliate_id: z.string().uuid(),
  status: WithdrawalStatusEnum.default("pending"),
  proof_url: z.string().nullable().optional(),
  proof_public_id: z.string().nullable().optional(),
  requested_at: z.string().optional(),
  completed_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  processed_by_admin_id: z.string().uuid().nullable().optional(),
});
export type Withdrawal = z.infer<typeof WithdrawalSchema>;
export type WithdrawalInput = z.infer<typeof WithdrawalInputSchema>;

// ==========================================
// 7. ANNOUNCEMENT SCHEMA
// ==========================================
export const AnnouncementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Title is required"),
  content: z.string().min(5, "Content is required"),
  image_url: z.string().nullable().optional(),
  image_public_id: z.string().nullable().optional(),
  created_by_admin_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;
