import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  Category,
  CartItem,
  Order,
  OrderStatus,
  StoreSettings,
  Voucher,
  Coupon,
  ProductReview,
  PaymentGatewayChannel,
} from '../types';
import {
  DEFAULT_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_STORE_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../data/mockData';
import { generateInvoiceNumber, generateTrackingNumber } from '../utils/formatters';

interface StoreContextType {
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  settings: StoreSettings;
  coupons: Coupon[];
  appliedVoucher: Coupon | null;
  reviews: ProductReview[];
  wishlist: string[];

  // UI states
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Thermal print state
  isThermalModalOpen: boolean;
  setIsThermalModalOpen: (open: boolean) => void;
  thermalOrders: Order[];
  openThermalReceipt: (orderOrOrders: Order | Order[]) => void;

  // Payment Gateway Modal State
  isGatewayModalOpen: boolean;
  setIsGatewayModalOpen: (open: boolean) => void;
  activeGatewayOrder: Order | null;
  openPaymentGateway: (order: Order) => void;
  closePaymentGateway: () => void;
  handleGatewayCallback: (
    orderId: string,
    result: 'success' | 'failed' | 'cancelled',
    channel?: PaymentGatewayChannel
  ) => void;

  // Auth Actions
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  quickLogin: (role: 'admin' | 'customer') => void;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Wishlist operations
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

  // Coupon / Voucher operations
  applyVoucher: (
    code: string,
    currentSubtotal?: number,
    shippingFee?: number
  ) => { success: boolean; message: string; discountAmount?: number };
  removeVoucher: () => void;
  calculateCouponDiscount: (coupon: Coupon | null, subtotal: number, shippingFee: number) => number;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCouponActive: (couponId: string) => void;

  // Order operations
  createOrder: (data: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'trackingTimeline'>) => Order;
  uploadPaymentProof: (orderId: string, proofUrl: string) => void;
  verifyOrderPayment: (orderId: string, approved: boolean) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => void;
  assignTrackingNumber: (orderId: string, trackingNumber?: string) => string;
  findOrderByTracking: (query: string) => Order | null;

  // Review operations
  addReview: (
    review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulVotes' | 'isApproved'>
  ) => void;
  voteHelpful: (reviewId: string) => void;
  moderateReview: (reviewId: string, approve: boolean) => void;
  deleteReview: (reviewId: string) => void;
  getProductReviews: (productId: string, includeUnapproved?: boolean) => ProductReview[];

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // Settings
  updateStoreSettings: (newSettings: StoreSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sv_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return DEFAULT_USERS[1]; // John Doe
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sv_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sv_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_CATEGORIES;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sv_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_ORDERS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sv_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return [];
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sv_coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_COUPONS;
  });

  // Applied Voucher
  const [appliedVoucher, setAppliedVoucher] = useState<Coupon | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    const saved = localStorage.getItem('sv_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_REVIEWS;
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sv_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return ['prd_01', 'prd_02']; // Sample pre-saved wishlist
  });

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('sv_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_STORE_SETTINGS;
  });

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Thermal modal states
  const [isThermalModalOpen, setIsThermalModalOpen] = useState(false);
  const [thermalOrders, setThermalOrders] = useState<Order[]>([]);

  // Payment Gateway Simulator Modal State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [activeGatewayOrder, setActiveGatewayOrder] = useState<Order | null>(null);

  // Sync states to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sv_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sv_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sv_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sv_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sv_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sv_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sv_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth methods
  const login = (email: string, password?: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const user = DEFAULT_USERS.find(u => u.email.toLowerCase() === trimmed);
    if (user) {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      return true;
    }
    if (trimmed.includes('admin')) {
      setCurrentUser(DEFAULT_USERS[0]);
      setIsAuthModalOpen(false);
      return true;
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: trimmed,
      role: 'customer',
      phone: '08123456789',
      address: 'Jl. Merdeka No. 12',
      city: 'Jakarta Selatan',
      postalCode: '12190',
    };
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const quickLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setCurrentUser(DEFAULT_USERS[0]);
    } else {
      setCurrentUser(DEFAULT_USERS[1]);
    }
    setIsAuthModalOpen(false);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  // Coupon / Discount Calculation
  const calculateCouponDiscount = (
    coupon: Coupon | null,
    subtotal: number,
    shippingFee: number
  ): number => {
    if (!coupon || !coupon.isActive) return 0;
    if (subtotal < coupon.minPurchase) return 0;

    if (coupon.discountType === 'percentage') {
      let discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      return Math.min(discount, subtotal);
    } else if (coupon.discountType === 'fixed') {
      return Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'free_shipping') {
      return shippingFee;
    }
    return 0;
  };

  const applyVoucher = (
    code: string,
    currentSubtotal?: number,
    shippingFee: number = 0
  ) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(v => v.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Kode kupon tidak ditemukan.' };
    }

    if (!found.isActive) {
      return { success: false, message: 'Kupon ini sedang tidak aktif.' };
    }

    // Check validity dates
    const today = new Date().toISOString().slice(0, 10);
    if (found.startDate && today < found.startDate) {
      return { success: false, message: `Kupon baru berlaku mulai ${found.startDate}.` };
    }
    if (found.expiryDate && today > found.expiryDate) {
      return { success: false, message: `Kupon telah kedaluwarsa pada ${found.expiryDate}.` };
    }

    // Check usage limits
    if (found.usageLimit && found.usageCount >= found.usageLimit) {
      return { success: false, message: 'Batas kuota pemakaian kupon ini telah habis.' };
    }

    // Check minimum purchase if subtotal provided
    const cartSubtotal =
      currentSubtotal !== undefined
        ? currentSubtotal
        : cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (cartSubtotal < found.minPurchase) {
      return {
        success: false,
        message: `Minimal belanja Rp ${found.minPurchase.toLocaleString('id-ID')} untuk menggunakan kupon ini.`,
      };
    }

    setAppliedVoucher(found);
    const disc = calculateCouponDiscount(found, cartSubtotal, shippingFee);
    return {
      success: true,
      message: `Kupon ${found.code} berhasil digunakan!`,
      discountAmount: disc,
    };
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn_${Date.now()}`,
      usageCount: 0,
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const updateCoupon = (updated: Coupon) => {
    setCoupons(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    if (appliedVoucher?.id === couponId) {
      setAppliedVoucher(null);
    }
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Review Operations
  const addReview = (
    reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulVotes' | 'isApproved'>
  ) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulVotes: 0,
      isApproved: true, // auto approved or can be moderated
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate average rating for the product
    setProducts(prevProds =>
      prevProds.map(prod => {
        if (prod.id === reviewData.productId) {
          const productReviews = [
            ...reviews.filter(r => r.productId === prod.id && r.isApproved),
            newReview,
          ];
          const avg =
            productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
          return {
            ...prod,
            rating: Math.round(avg * 10) / 10,
            reviewsCount: productReviews.length,
          };
        }
        return prod;
      })
    );
  };

  const voteHelpful = (reviewId: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r))
    );
  };

  const moderateReview = (reviewId: string, approve: boolean) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, isApproved: approve } : r))
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const getProductReviews = (
    productId: string,
    includeUnapproved = false
  ): ProductReview[] => {
    return reviews.filter(
      r => r.productId === productId && (includeUnapproved || r.isApproved)
    );
  };

  // Order creation
  const createOrder = (
    data: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'trackingTimeline'>
  ): Order => {
    const now = new Date();
    const isGateway = data.paymentMethod === 'payment_gateway';

    const newOrder: Order = {
      ...data,
      id: `ord_${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      createdAt: now.toISOString(),
      trackingTimeline: [
        {
          time:
            new Intl.DateTimeFormat('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(now) + ' WIB',
          status: 'Pesanan Dibuat',
          location: 'ShopVista Online Store',
          description: `Pesanan telah diterima oleh sistem. ${
            data.paymentMethod === 'cod'
              ? 'Metode pembayaran COD (Bayar di tempat).'
              : isGateway
              ? 'Menunggu penyelesaian pembayaran online via Payment Gateway.'
              : 'Menunggu transfer bank manual.'
          }`,
          isCompleted: true,
        },
      ],
    };

    // Increment coupon usage count if used
    if (data.voucherCode) {
      setCoupons(prev =>
        prev.map(c =>
          c.code.toUpperCase() === data.voucherCode?.toUpperCase()
            ? { ...c, usageCount: c.usageCount + 1 }
            : c
        )
      );
    }

    // Deduct stock from products
    setProducts(prev =>
      prev.map(prod => {
        const orderedItem = data.items.find(i => i.productId === prod.id);
        if (orderedItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderedItem.quantity),
          };
        }
        return prod;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Payment Gateway Handlers
  const openPaymentGateway = (order: Order) => {
    setActiveGatewayOrder(order);
    setIsGatewayModalOpen(true);
  };

  const closePaymentGateway = () => {
    setIsGatewayModalOpen(false);
    setActiveGatewayOrder(null);
  };

  const handleGatewayCallback = (
    orderId: string,
    result: 'success' | 'failed' | 'cancelled',
    channel?: PaymentGatewayChannel
  ) => {
    const now = new Date();
    const timeStr =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now) + ' WIB';

    const channelNameMap: Record<string, string> = {
      credit_card: 'Kartu Kredit (Visa/Mastercard)',
      gopay: 'GoPay E-Wallet',
      qris: 'QRIS Real-Time Scan',
      dana: 'DANA E-Wallet',
      shopeepay: 'ShopeePay',
      bca_va: 'BCA Virtual Account',
      mandiri_va: 'Mandiri Virtual Account',
      bni_va: 'BNI Virtual Account',
      bri_va: 'BRI Virtual Account',
    };

    const channelTitle = channel ? channelNameMap[channel] || channel : 'Online Gateway';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          if (result === 'success') {
            const trxId = `PG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            return {
              ...ord,
              paymentStatus: 'paid',
              orderStatus: 'processing',
              gatewayChannel: channel,
              gatewayPaymentStatus: 'settlement',
              gatewayTransactionId: trxId,
              gatewayPaidAt: now.toISOString(),
              trackingTimeline: [
                ...ord.trackingTimeline,
                {
                  time: timeStr,
                  status: 'Pembayaran Gateway Berhasil (Settlement)',
                  location: 'Midtrans / Xendit Payment Gateway',
                  description: `Pembayaran lunas terverifikasi otomatis via ${channelTitle}. No. Referensi: ${trxId}`,
                  isCompleted: true,
                },
                {
                  time: timeStr,
                  status: 'Sedang Disiapkan di Gudang',
                  location: 'Warehouse SCBD Jakarta',
                  description: 'Pesanan masuk antrean pengepakan dan pembuatan label pengiriman.',
                  isCompleted: true,
                },
              ],
            };
          } else if (result === 'failed') {
            return {
              ...ord,
              paymentStatus: 'failed',
              gatewayPaymentStatus: 'deny',
              trackingTimeline: [
                ...ord.trackingTimeline,
                {
                  time: timeStr,
                  status: 'Pembayaran Gateway Gagal',
                  location: 'Payment Gateway Security',
                  description: `Transaksi pembayaran via ${channelTitle} ditolak atau gagal. Silakan ulangi transaksi.`,
                  isCompleted: false,
                },
              ],
            };
          } else {
            // Cancelled
            return {
              ...ord,
              gatewayPaymentStatus: 'cancel',
            };
          }
        }
        return ord;
      })
    );
  };

  // Payment proof upload
  const uploadPaymentProof = (orderId: string, proofUrl: string) => {
    const now = new Date();
    const timeStr =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now) + ' WIB';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentProofUrl: proofUrl,
            paymentProofUploadedAt: now.toISOString(),
            paymentStatus: 'verification_pending',
            trackingTimeline: [
              ...ord.trackingTimeline,
              {
                time: timeStr,
                status: 'Bukti Transfer Diunggah',
                location: 'Payment Verification System',
                description:
                  'Pelanggan telah mengunggah bukti transfer bank. Menunggu verifikasi admin.',
                isCompleted: true,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  // Payment verification by Admin
  const verifyOrderPayment = (orderId: string, approved: boolean) => {
    const now = new Date();
    const timeStr =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now) + ' WIB';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          if (approved) {
            return {
              ...ord,
              paymentStatus: 'paid',
              orderStatus: 'processing',
              trackingTimeline: [
                ...ord.trackingTimeline,
                {
                  time: timeStr,
                  status: 'Pembayaran Dikonfirmasi Lunas',
                  location: 'ShopVista Finance',
                  description:
                    'Pembayaran berhasil diverifikasi. Pesanan masuk tahap penyiapan dan pengepakan.',
                  isCompleted: true,
                },
              ],
            };
          } else {
            return {
              ...ord,
              paymentStatus: 'unpaid',
              orderStatus: 'pending',
              paymentProofUrl: undefined,
              trackingTimeline: [
                ...ord.trackingTimeline,
                {
                  time: timeStr,
                  status: 'Bukti Pembayaran Ditolak',
                  location: 'ShopVista Finance',
                  description:
                    'Bukti transfer tidak sesuai. Silakan upload ulang bukti transfer yang valid.',
                  isCompleted: false,
                },
              ],
            };
          }
        }
        return ord;
      })
    );
  };

  // Update order status & generate tracking resi
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    trackingNumber?: string
  ) => {
    const now = new Date();
    const timeStr =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now) + ' WIB';

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          let updatedResi = ord.trackingNumber;
          const newMilestones = [...ord.trackingTimeline];

          if (newStatus === 'shipped') {
            if (!updatedResi) {
              updatedResi = trackingNumber || generateTrackingNumber(ord.courierCode);
            }
            newMilestones.push({
              time: timeStr,
              status: 'Paket Diserahkan ke Ekspedisi',
              location: `${ord.courierName} Drop Point Hub`,
              description: `Paket telah dipickup oleh kurir ${ord.courierName}. No. Resi: ${updatedResi}`,
              isCompleted: true,
            });
          } else if (newStatus === 'delivered') {
            newMilestones.push({
              time: timeStr,
              status: 'Pesanan Telah Tiba di Tujuan',
              location: ord.destinationCity,
              description: `Paket berhasil diterima oleh ${ord.customerName}. Transaksi selesai. Terima kasih telah berbelanja di ShopVista!`,
              isCompleted: true,
            });
          } else if (newStatus === 'cancelled') {
            newMilestones.push({
              time: timeStr,
              status: 'Pesanan Dibatalkan',
              location: 'ShopVista Operations',
              description: 'Pesanan telah dibatalkan.',
              isCompleted: true,
            });
          }

          return {
            ...ord,
            orderStatus: newStatus,
            trackingNumber: updatedResi,
            trackingTimeline: newMilestones,
          };
        }
        return ord;
      })
    );
  };

  const assignTrackingNumber = (orderId: string, customResi?: string): string => {
    const target = orders.find(o => o.id === orderId);
    const resi =
      customResi?.trim() || generateTrackingNumber(target?.courierCode || 'shopvista');
    updateOrderStatus(orderId, 'shipped', resi);
    return resi;
  };

  // Thermal modal trigger
  const openThermalReceipt = (orderOrOrders: Order | Order[]) => {
    const list = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders];
    setThermalOrders(list);
    setIsThermalModalOpen(true);
  };

  // Tracking finder
  const findOrderByTracking = (query: string): Order | null => {
    const clean = query.trim().toUpperCase();
    if (!clean) return null;
    return (
      orders.find(
        o =>
          (o.trackingNumber && o.trackingNumber.toUpperCase() === clean) ||
          o.invoiceNumber.toUpperCase() === clean ||
          o.id.toUpperCase() === clean
      ) || null
    );
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prd_${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (updated: Category) => {
    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const updateStoreSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        products,
        categories,
        orders,
        cart,
        settings,
        coupons,
        appliedVoucher,
        reviews,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        activeTrackingOrder,
        setActiveTrackingOrder,
        isThermalModalOpen,
        setIsThermalModalOpen,
        thermalOrders,
        openThermalReceipt,
        isGatewayModalOpen,
        setIsGatewayModalOpen,
        activeGatewayOrder,
        openPaymentGateway,
        closePaymentGateway,
        handleGatewayCallback,
        login,
        logout,
        quickLogin,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        applyVoucher,
        removeVoucher,
        calculateCouponDiscount,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        createOrder,
        uploadPaymentProof,
        verifyOrderPayment,
        updateOrderStatus,
        assignTrackingNumber,
        findOrderByTracking,
        addReview,
        voteHelpful,
        moderateReview,
        deleteReview,
        getProductReviews,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateStoreSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
