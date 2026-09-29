export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  image: string;
  description: string;
  specs: { label: string; value: string }[];
  weight: number; // in grams
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CourierCode = 'shopvista' | 'jne' | 'jnt' | 'sicepat' | 'pickup';

export interface CourierOption {
  code: CourierCode;
  name: string;
  service: string;
  baseCost: number;
  etd: string; // Estimated time of arrival, e.g. "1-2 Hari"
  description: string;
  enabled: boolean;
}

export type PaymentMethod = 'transfer_bank' | 'cod' | 'payment_gateway';
export type PaymentGatewayChannel =
  | 'credit_card'
  | 'gopay'
  | 'qris'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bni_va'
  | 'bri_va';

export type PaymentStatus = 'unpaid' | 'verification_pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface BankAccount {
  id: string;
  bank: 'BCA' | 'Mandiri' | 'BRI' | 'BNI';
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
}

export interface TrackingMilestone {
  time: string;
  status: string;
  location: string;
  description: string;
  isCompleted: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  weight: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  destinationCity: string;
  postalCode: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  voucherCode?: string;
  courierCode: CourierCode;
  courierName: string;
  courierService: string;
  shippingCost: number;
  isFreeShipping: boolean;
  totalWeight: number; // in grams
  totalAmount: number;
  paymentMethod: PaymentMethod;
  selectedBank?: BankAccount;
  gatewayChannel?: PaymentGatewayChannel;
  gatewayTransactionId?: string;
  gatewayPaymentStatus?: 'settlement' | 'pending' | 'deny' | 'expire' | 'cancel';
  gatewayPaidAt?: string;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  trackingTimeline: TrackingMilestone[];
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedBuyer: boolean;
  isApproved: boolean; // moderation flag
  helpfulVotes: number;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number; // percentage value (e.g., 10 for 10%) or fixed amount (e.g., 50000) or 0 for free_shipping
  maxDiscountAmount?: number; // max cap for percentage discounts
  minPurchase: number;
  startDate: string; // ISO date string (YYYY-MM-DD)
  expiryDate: string; // ISO date string (YYYY-MM-DD)
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

// Backwards compatibility alias
export type Voucher = Coupon;

export interface StoreSettings {

  storeName: string;
  slogan: string;
  logoText: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  freeShippingMinAmount: number;
  bankAccounts: BankAccount[];
  availableCouriers: CourierOption[];
}
