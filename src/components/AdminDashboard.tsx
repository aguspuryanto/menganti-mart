import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Printer,
  CheckCircle2,
  XCircle,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Settings as SettingsIcon,
  Store,
  Search,
  Check,
  Filter,
  Layers,
  Save,
  ShieldCheck,
  AlertCircle,
  Tag,
  Star,
  MessageSquare,
  QrCode,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, Category, Coupon, ProductReview } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const {
    orders,
    products,
    categories,
    settings,
    coupons,
    reviews,
    verifyOrderPayment,
    updateOrderStatus,
    assignTrackingNumber,
    openThermalReceipt,
    openPaymentGateway,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateStoreSettings,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
    moderateReview,
    deleteReview,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'categories' | 'coupons' | 'reviews' | 'settings'
  >('orders');

  // Orders tab states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [inspectProofOrder, setInspectProofOrder] = useState<Order | null>(null);
  const [resiInputOrder, setResiInputOrder] = useState<{ id: string; resi: string } | null>(null);

  // Products tab states
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    price: 0,
    originalPrice: 0,
    discountPercent: 0,
    stock: 10,
    rating: 4.8,
    reviewsCount: 10,
    isFeatured: false,
    image: '',
    description: '',
    weight: 300,
    specs: [],
  });

  // Coupons tab states
  const [couponModalMode, setCouponModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 100000,
    minPurchase: 50000,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 100,
    isActive: true,
  });

  // Reviews tab filter
  const [reviewFilterRating, setReviewFilterRating] = useState<string>('all');

  // Category tab state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Settings tab state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Statistics calculation
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingVerificationCount = orders.filter(
    o => o.paymentStatus === 'verification_pending'
  ).length;

  const processingCount = orders.filter(o => o.orderStatus === 'processing').length;
  const shippedCount = orders.filter(o => o.orderStatus === 'shipped').length;

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'verification_pending') {
        if (order.paymentStatus !== 'verification_pending') return false;
      } else if (order.orderStatus !== orderStatusFilter) {
        return false;
      }
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      return (
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Bulk print handler
  const handleBulkPrint = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    if (selectedOrders.length === 0) {
      alert('Pilih minimal 1 pesanan untuk dicetak massal.');
      return;
    }
    openThermalReceipt(selectedOrders);
  };

  const handleSelectAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Product CRUD handlers
  const handleOpenAddProduct = () => {
    setProductForm({
      name: '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      price: 150000,
      originalPrice: 190000,
      discountPercent: 20,
      stock: 25,
      rating: 4.8,
      reviewsCount: 15,
      isFeatured: false,
      image: products[0]?.image || '',
      description: 'Produk berkualitas tinggi dengan garansi resmi dan performa andal.',
      weight: 350,
      specs: [{ label: 'Garansi', value: '1 Tahun Resmi' }],
    });
    setEditingProduct(null);
    setProductModalMode('create');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm(prod);
    setProductModalMode('edit');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find(c => c.id === productForm.categoryId);
    const catName = cat ? cat.name : categories[0]?.name || 'Umum';

    if (productModalMode === 'create') {
      addProduct({
        name: productForm.name || 'Produk Baru',
        slug: (productForm.name || 'produk-baru').toLowerCase().replace(/\s+/g, '-'),
        categoryId: productForm.categoryId || categories[0]?.id || 'cat_audio',
        categoryName: catName,
        price: Number(productForm.price) || 100000,
        originalPrice: Number(productForm.originalPrice) || Number(productForm.price),
        discountPercent: Number(productForm.discountPercent) || 0,
        stock: Number(productForm.stock) || 0,
        rating: Number(productForm.rating) || 5.0,
        reviewsCount: Number(productForm.reviewsCount) || 1,
        isFeatured: Boolean(productForm.isFeatured),
        image: productForm.image || products[0]?.image || '',
        description: productForm.description || '',
        weight: Number(productForm.weight) || 300,
        specs: productForm.specs || [],
      });
    } else if (productModalMode === 'edit' && editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        categoryId: productForm.categoryId || editingProduct.categoryId,
        categoryName: catName,
        price: Number(productForm.price) || editingProduct.price,
        stock: Number(productForm.stock) ?? editingProduct.stock,
      } as Product);
    }
    setProductModalMode(null);
  };

  // Coupon CRUD handlers
  const handleOpenAddCoupon = () => {
    setCouponForm({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 100000,
      minPurchase: 100000,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: '2026-12-31',
      usageLimit: 50,
      isActive: true,
    });
    setEditingCoupon(null);
    setCouponModalMode('create');
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm(coupon);
    setCouponModalMode('edit');
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code?.trim()) return;

    if (couponModalMode === 'create') {
      addCoupon({
        code: couponForm.code.trim().toUpperCase(),
        name: couponForm.name || 'Kupon Promosi',
        description: couponForm.description || '',
        discountType: couponForm.discountType || 'percentage',
        discountValue: Number(couponForm.discountValue) || 0,
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : undefined,
        minPurchase: Number(couponForm.minPurchase) || 0,
        startDate: couponForm.startDate || '2026-01-01',
        expiryDate: couponForm.expiryDate || '2026-12-31',
        usageLimit: Number(couponForm.usageLimit) || 100,
        isActive: Boolean(couponForm.isActive),
      });
    } else if (couponModalMode === 'edit' && editingCoupon) {
      updateCoupon({
        ...editingCoupon,
        ...couponForm,
        code: couponForm.code.trim().toUpperCase(),
        discountValue: Number(couponForm.discountValue) || 0,
        minPurchase: Number(couponForm.minPurchase) || 0,
      } as Coupon);
    }
    setCouponModalMode(null);
  };

  // Category handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().trim().replace(/\s+/g, '-'),
      description: newCatDesc.trim() || 'Kategori produk ShopVista',
      itemCount: 0,
    });
    setNewCatName('');
    setNewCatDesc('');
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Filtered reviews
  const filteredReviews = reviews.filter(rev => {
    if (reviewFilterRating === 'all') return true;
    return rev.rating === Number(reviewFilterRating);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans text-left">
      {/* Admin Top Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                SV
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  ShopVista Admin Portal
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  v3.8 · CodeIgniter & MySQL Edition
                </span>
              </div>
            </div>

            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Katalog Toko</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Omzet Lunas
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Dari seluruh transaksi terverifikasi</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Perlu Verifikasi Bukti
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-600 mt-2">
              {pendingVerificationCount} Pesanan
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Bukti transfer menunggu persetujuan</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kupon & Voucher Aktif
              </span>
              <Tag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {coupons.filter(c => c.isActive).length} Kupon
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Diskon tetap, % & Bebas Ongkir</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Ulasan Pembeli
              </span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
              {reviews.length} Ulasan
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Moderasi & rating bintang</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pesanan & Gateway ({orders.length})</span>
            {pendingVerificationCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produk ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'coupons'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kupon & Diskon ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Moderasi Ulasan ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kategori ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Pengaturan Toko</span>
          </button>
        </div>

        {/* TAB 1: MANAJEMEN PESANAN (ORDERS & GATEWAY) */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Filter toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Invoice, Pelanggan, atau Resi..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                {[
                  { id: 'all', label: 'Semua Status' },
                  { id: 'verification_pending', label: 'Perlu Verifikasi' },
                  { id: 'processing', label: 'Diproses' },
                  { id: 'shipped', label: 'Dikirim' },
                  { id: 'delivered', label: 'Selesai' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setOrderStatusFilter(f.id)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      orderStatusFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {selectedOrderIds.length > 0 && (
                <button
                  onClick={handleBulkPrint}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Massal ({selectedOrderIds.length} Resi Thermal)</span>
                </button>
              )}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4 w-8">
                      <input
                        type="checkbox"
                        checked={
                          filteredOrders.length > 0 &&
                          selectedOrderIds.length === filteredOrders.length
                        }
                        onChange={handleSelectAllOrders}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="p-3">Invoice & Tanggal</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Total Transaksi</th>
                    <th className="p-3">Metode & Status Bayar</th>
                    <th className="p-3">Ekspedisi & Resi</th>
                    <th className="p-3">Status Pesanan</th>
                    <th className="p-3 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Tidak ada pesanan yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isSelected = selectedOrderIds.includes(order.id);
                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="p-3 pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOrder(order.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>

                          {/* Invoice */}
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-900">
                              {order.invoiceNumber}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {order.destinationCity} · {order.customerPhone}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="p-3">
                            <div className="font-bold font-mono text-slate-900">
                              {formatRupiah(order.totalAmount)}
                            </div>
                            {order.voucherCode && (
                              <div className="text-[10px] text-emerald-700 font-mono">
                                Kupon: {order.voucherCode}
                              </div>
                            )}
                          </td>

                          {/* Payment status & Gateway Badge */}
                          <td className="p-3">
                            <div className="space-y-1">
                              {order.paymentStatus === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                  ✓ Lunas{' '}
                                  {order.paymentMethod === 'payment_gateway'
                                    ? `(${order.gatewayChannel?.toUpperCase() || 'GATEWAY'})`
                                    : order.paymentMethod === 'cod'
                                    ? '(COD)'
                                    : '(Transfer)'}
                                </span>
                              ) : order.paymentStatus === 'verification_pending' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded animate-pulse">
                                  ⏳ Menunggu Verifikasi
                                </span>
                              ) : order.paymentStatus === 'failed' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                                  ✕ Pembayaran Gagal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  Belum Bayar
                                </span>
                              )}

                              {/* Gateway reference or simulator button */}
                              {order.paymentMethod === 'payment_gateway' && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {order.gatewayTransactionId ? (
                                    <span>Ref: {order.gatewayTransactionId}</span>
                                  ) : (
                                    <button
                                      onClick={() => openPaymentGateway(order)}
                                      className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                                    >
                                      <QrCode className="w-3 h-3" />
                                      <span>Buka Snap Gateway</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {order.paymentProofUrl && (
                                <button
                                  onClick={() => setInspectProofOrder(order)}
                                  className="text-[10px] text-emerald-700 hover:text-emerald-900 underline block font-semibold cursor-pointer"
                                >
                                  Periksa Bukti Bayar ↗
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Courier & Tracking */}
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">
                              {order.courierName}
                            </div>
                            {order.trackingNumber ? (
                              <div className="font-mono text-[11px] text-emerald-700 font-bold">
                                {order.trackingNumber}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setResiInputOrder({
                                    id: order.id,
                                    resi: '',
                                  })
                                }
                                className="text-[10px] text-blue-600 hover:underline font-semibold"
                              >
                                + Input / Buat Resi
                              </button>
                            )}
                          </td>

                          {/* Order Status */}
                          <td className="p-3">
                            <select
                              value={order.orderStatus}
                              onChange={e =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none focus:border-emerald-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Diproses</option>
                              <option value="shipped">Dikirim</option>
                              <option value="delivered">Selesai</option>
                              <option value="cancelled">Dibatalkan</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openThermalReceipt(order)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="Cetak Resi Thermal 100x165mm"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN PRODUK */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Katalog Produk Toko</h3>
                <p className="text-xs text-slate-500">
                  Kelola inventaris, stok produk, harga diskon, dan produk unggulan
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Produk</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Diskon</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Unggulan</th>
                    <th className="p-3 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4 flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">Berat: {prod.weight}g</p>
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-slate-700">{prod.categoryName}</td>

                      <td className="p-3 font-mono font-bold text-slate-900">
                        {formatRupiah(prod.price)}
                      </td>

                      <td className="p-3">
                        {prod.discountPercent && prod.discountPercent > 0 ? (
                          <span className="bg-rose-50 text-rose-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            -{prod.discountPercent}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`font-mono font-bold text-xs ${
                            prod.stock <= 5 ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {prod.stock} unit
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{prod.rating}</span>
                          <span className="text-slate-400 font-normal">({prod.reviewsCount})</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => updateProduct({ ...prod, isFeatured: !prod.isFeatured })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prod.isFeatured
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {prod.isFeatured ? '★ Unggulan' : 'Standar'}
                        </button>
                      </td>

                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAJEMEN KUPON & DISKON (NEW!) */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manajemen Kupon & Diskon Promosi
                </h3>
                <p className="text-xs text-slate-500">
                  Buat kupon potongan nominal tetap, diskon persentase %, dan kupon bebas ongkir
                </p>
              </div>

              <button
                onClick={handleOpenAddCoupon}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kupon Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Kode Kupon & Nama</th>
                    <th className="p-3">Tipe Diskon</th>
                    <th className="p-3">Nilai Potongan</th>
                    <th className="p-3">Min. Belanja</th>
                    <th className="p-3">Masa Berlaku</th>
                    <th className="p-3">Penggunaan / Kuota</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded w-fit">
                          {coupon.code}
                        </div>
                        <div className="font-bold text-slate-900 mt-1">{coupon.name}</div>
                        <div className="text-[11px] text-slate-400">{coupon.description}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold capitalize text-slate-800">
                          {coupon.discountType === 'percentage'
                            ? 'Persentase (%)'
                            : coupon.discountType === 'fixed'
                            ? 'Nominal Tetap (Rp)'
                            : 'Gratis Ongkir 100%'}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-900">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% (Maks. ${formatRupiah(
                              coupon.maxDiscountAmount || 0
                            )})`
                          : coupon.discountType === 'fixed'
                          ? formatRupiah(coupon.discountValue)
                          : 'Bebas Ongkir'}
                      </td>

                      <td className="p-3 font-mono text-slate-700">
                        {formatRupiah(coupon.minPurchase)}
                      </td>

                      <td className="p-3 text-[11px] text-slate-500">
                        <div>Mulai: {coupon.startDate}</div>
                        <div>Sampai: {coupon.expiryDate}</div>
                      </td>

                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900">{coupon.usageCount}</span>
                        <span className="text-slate-400"> / {coupon.usageLimit} kuota</span>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => toggleCouponActive(coupon.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            coupon.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {coupon.isActive ? '✓ Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditCoupon(coupon)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Kupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kupon "${coupon.code}"?`)) {
                                deleteCoupon(coupon.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Kupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MODERASI ULASAN (REVIEWS MODERATION) (NEW!) */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Moderasi Ulasan & Penilaian Produk
                </h3>
                <p className="text-xs text-slate-500">
                  Setujui, sembunyikan, atau hapus ulasan pelanggan untuk menjaga kualitas toko
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">Filter Bintang:</span>
                <select
                  value={reviewFilterRating}
                  onChange={e => setReviewFilterRating(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none font-semibold text-slate-700"
                >
                  <option value="all">Semua Bintang ({reviews.length})</option>
                  <option value="5">5 Bintang</option>
                  <option value="4">4 Bintang</option>
                  <option value="3">3 Bintang</option>
                  <option value="2">2 Bintang</option>
                  <option value="1">1 Bintang</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Produk</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Isi Ulasan & Komentar</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status Tampil</th>
                    <th className="p-3 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada ulasan yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-slate-900 max-w-xs truncate">
                          {rev.productName}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800">{rev.userName}</div>
                          <div className="text-[10px] text-slate-400">{rev.userEmail}</div>
                          {rev.isVerifiedBuyer && (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                              Verified Buyer
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </td>

                        <td className="p-3 max-w-sm">
                          <div className="font-bold text-slate-900 leading-tight">
                            {rev.title}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 mt-0.5">
                            {rev.comment}
                          </p>
                        </td>

                        <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDate(rev.createdAt)}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() => moderateReview(rev.id, !rev.isApproved)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rev.isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rev.isApproved ? 'Ditampilkan' : 'Disembunyikan'}
                          </button>
                        </td>

                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => {
                              if (confirm('Hapus ulasan ini secara permanen?')) {
                                deleteReview(rev.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Ulasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MANAJEMEN KATEGORI */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Tambah Kategori Baru</h3>
              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kategori *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aksesoris Gaming"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsi kategori..."
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </form>
            </div>

            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Daftar Kategori ({categories.length})
              </h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{cat.name}</div>
                        <div className="text-[11px] text-slate-500">{cat.description}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {count} Produk Terdaftar
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus kategori "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PENGATURAN TOKO */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-4xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Pengaturan Identitas & Pembayaran Toko
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Pengaturan ini langsung memengaruhi identitas toko pada resi pengiriman thermal, nomor rekening checkout, dan kalkulasi ongkir.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan toko berhasil diperbarui!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Toko</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={e =>
                      setSettingsForm({ ...settingsForm, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slogan Toko</label>
                  <input
                    type="text"
                    value={settingsForm.slogan}
                    onChange={e => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp CS (tanpa tanda +)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={e =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telepon Toko (Muncul di Resi)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phoneNumber}
                    onChange={e =>
                      setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimal Belanja Bebas Ongkir (Rp)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingMinAmount}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        freeShippingMinAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kota Asal Toko (Warehouse Origin)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.city}
                    onChange={e => setSettingsForm({ ...settingsForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Pengirim (Warehouse)
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.address}
                  onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Pengaturan</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* MODAL INSPECT PAYMENT PROOF */}
      {inspectProofOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                Verifikasi Bukti Transfer - {inspectProofOrder.invoiceNumber}
              </h3>
              <button
                onClick={() => setInspectProofOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p>
                  <strong>Pelanggan:</strong> {inspectProofOrder.customerName}
                </p>
                <p>
                  <strong>Total Tagihan:</strong>{' '}
                  <span className="font-mono font-bold text-emerald-700">
                    {formatRupiah(inspectProofOrder.totalAmount)}
                  </span>
                </p>
                <p>
                  <strong>Tujuan:</strong> Bank {inspectProofOrder.selectedBank?.bank || 'BCA'} (
                  {inspectProofOrder.selectedBank?.accountNumber})
                </p>
              </div>

              {inspectProofOrder.paymentProofUrl && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center p-2">
                  <img
                    src={inspectProofOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="max-h-72 object-contain rounded"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    verifyOrderPayment(inspectProofOrder.id, false);
                    setInspectProofOrder(null);
                  }}
                  className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Bukti</span>
                </button>

                <button
                  onClick={() => {
                    verifyOrderPayment(inspectProofOrder.id, true);
                    setInspectProofOrder(null);
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi Lunas (Setujui)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / GENERATE RESI */}
      {resiInputOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden text-left p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Input Nomor Resi Pengiriman</h3>
            <p className="text-xs text-slate-500">
              Masukkan nomor resi manual atau klik buat otomatis untuk mengupdate status ke Dikirim.
            </p>

            <input
              type="text"
              placeholder="Contoh: SVX982183921ID"
              value={resiInputOrder.resi}
              onChange={e => setResiInputOrder({ ...resiInputOrder, resi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono uppercase focus:border-emerald-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  assignTrackingNumber(resiInputOrder.id, resiInputOrder.resi);
                  setResiInputOrder(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
              >
                Kirim & Update Resi
              </button>
              <button
                onClick={() => setResiInputOrder(null)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT COUPON */}
      {couponModalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-left">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {couponModalMode === 'create' ? 'Buat Kupon Baru' : 'Edit Kupon'}
              </h3>
              <button
                onClick={() => setCouponModalMode(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Kupon *</label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: HEMAT100K"
                    value={couponForm.code}
                    onChange={e =>
                      setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono uppercase focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kupon *</label>
                  <input
                    type="text"
                    required
                    placeholder="Diskon Gajian"
                    value={couponForm.name}
                    onChange={e => setCouponForm({ ...couponForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Diskon *</label>
                <select
                  value={couponForm.discountType}
                  onChange={e =>
                    setCouponForm({
                      ...couponForm,
                      discountType: e.target.value as 'percentage' | 'fixed' | 'free_shipping',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                  <option value="free_shipping">Gratis Ongkos Kirim (100%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {couponForm.discountType !== 'free_shipping' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {couponForm.discountType === 'percentage'
                        ? 'Nilai Persen (%) *'
                        : 'Nilai Potongan (Rp) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={couponForm.discountValue}
                      onChange={e =>
                        setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                    />
                  </div>
                )}

                {couponForm.discountType === 'percentage' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Maksimal Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={couponForm.maxDiscountAmount}
                      onChange={e =>
                        setCouponForm({
                          ...couponForm,
                          maxDiscountAmount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimal Belanja (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.minPurchase}
                    onChange={e =>
                      setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Batas Kuota Pemakaian *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.usageLimit}
                    onChange={e =>
                      setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={couponForm.startDate}
                    onChange={e => setCouponForm({ ...couponForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kedaluwarsa *
                  </label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiryDate}
                    onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan Kupon</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat..."
                  value={couponForm.description}
                  onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coupon-active-check"
                  checked={couponForm.isActive}
                  onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="coupon-active-check" className="font-semibold text-slate-700">
                  Kupon Aktif dan Dapat Digunakan Pelanggan
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCouponModalMode(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT PRODUCT */}
      {productModalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden text-left">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {productModalMode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}
              </h3>
              <button
                onClick={() => setProductModalMode(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Nama Lengkap Produk"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Berat Paket (Gram) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.weight}
                    onChange={e =>
                      setProductForm({ ...productForm, weight: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Coret (Rp)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={e =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Gudang *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e =>
                      setProductForm({ ...productForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Gambar Produk</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="/src/assets/images/... atau URL gambar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Deskripsi keunggulan produk..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={productForm.isFeatured}
                  onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="featured-check" className="font-semibold text-slate-700">
                  Tandai sebagai Produk Unggulan di Halaman Utama
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalMode(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
