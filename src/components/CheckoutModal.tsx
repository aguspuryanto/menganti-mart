import React, { useState } from 'react';
import {
  X,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  QrCode,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { CourierCode, PaymentMethod, BankAccount, Coupon } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CheckoutModalProps {
  onSuccessOrder: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onSuccessOrder }) => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    currentUser,
    settings,
    coupons,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    calculateCouponDiscount,
    createOrder,
    openPaymentGateway,
  } = useStore();

  // Customer Form state
  const [name, setName] = useState(currentUser?.name || 'John Doe');
  const [phone, setPhone] = useState(currentUser?.phone || '081388776655');
  const [email, setEmail] = useState(currentUser?.email || 'john@example.com');
  const [address, setAddress] = useState(
    currentUser?.address || 'Apartemen Menteng Park Tower Diamond Unit 12B, Jl. Cikini Raya No. 79'
  );
  const [city, setCity] = useState(currentUser?.city || 'Jakarta Pusat');
  const [postalCode, setPostalCode] = useState(currentUser?.postalCode || '10330');
  const [notes, setNotes] = useState('');

  // Shipping Selection
  const [selectedCourierCode, setSelectedCourierCode] = useState<CourierCode>('shopvista');

  // Payment Selection: default to payment_gateway for modern experience!
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payment_gateway');
  const [selectedBank, setSelectedBank] = useState<BankAccount>(settings.bankAccounts[0]);

  // Copy feedback state
  const [copiedBank, setCopiedBank] = useState(false);

  // Form error state
  const [errorMessage, setErrorMessage] = useState('');

  // Coupon Drawer / Selector Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  if (!isCheckoutOpen) return null;

  // Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.product.weight || 200) * item.quantity, 0);

  // Selected courier calculation
  const selectedCourier =
    settings.availableCouriers.find(c => c.code === selectedCourierCode) ||
    settings.availableCouriers[0];

  // Base shipping cost before coupons
  const isThresholdFree =
    subtotal >= settings.freeShippingMinAmount &&
    (selectedCourierCode === 'shopvista' || selectedCourierCode === 'pickup');

  const baseShippingCost = isThresholdFree || selectedCourierCode === 'pickup' ? 0 : selectedCourier.baseCost;

  // Calculate discount using central coupon engine
  const discountAmount = calculateCouponDiscount(appliedVoucher, subtotal, baseShippingCost);

  // Determine if free shipping coupon applied
  const isCouponFreeShipping = appliedVoucher?.discountType === 'free_shipping';
  const effectiveShippingCost = isCouponFreeShipping ? 0 : baseShippingCost;

  const totalAmount = Math.max(0, subtotal - (isCouponFreeShipping ? 0 : discountAmount) + effectiveShippingCost);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(selectedBank.accountNumber.replace(/\s+/g, ''));
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMessage('Mohon lengkapi semua kolom nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Keranjang Anda kosong.');
      return;
    }

    // Create Order object
    const created = createOrder({
      customerId: currentUser?.id || `usr_guest_${Date.now()}`,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      destinationCity: city.trim(),
      postalCode: postalCode.trim(),
      customerNotes: notes.trim(),
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        weight: i.product.weight || 200,
      })),
      subtotal,
      discount: discountAmount,
      voucherCode: appliedVoucher?.code,
      courierCode: selectedCourier.code,
      courierName: selectedCourier.name,
      courierService: selectedCourier.service,
      shippingCost: effectiveShippingCost,
      isFreeShipping: isThresholdFree || isCouponFreeShipping,
      totalWeight,
      totalAmount,
      paymentMethod,
      selectedBank: paymentMethod === 'transfer_bank' ? selectedBank : undefined,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
    });

    // Close checkout
    setIsCheckoutOpen(false);

    // If online Payment Gateway selected, open Midtrans / Xendit simulator immediately
    if (paymentMethod === 'payment_gateway') {
      openPaymentGateway(created);
    } else {
      // Confetti for manual or COD
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        /* ignore */
      }
      onSuccessOrder(created.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Formulir Checkout & Pengiriman
            </h2>
            <p className="text-xs text-slate-500">
              Periksa alamat pengiriman, opsi ekspedisi, dan pilih metode pembayaran
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Customer and Courier (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Alamat Pengiriman */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Data Pelanggan & Alamat Kirim</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Konfirmasi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Menteng Raya No. 12, Kel. Menteng, Kec. Menteng"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kota / Kabupaten *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      placeholder="12190"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Contoh: Titipkan ke satpam jika sedang keluar"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* 2. Pilihan Kurir & Ekspedisi */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <span>Pilihan Kurir & Layanan Pengiriman</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total Berat: {totalWeight} gram
                  </span>
                </div>

                <div className="space-y-2">
                  {settings.availableCouriers.map(courier => {
                    const isSelected = selectedCourierCode === courier.code;
                    const isEligibleFree =
                      isCouponFreeShipping ||
                      (subtotal >= settings.freeShippingMinAmount &&
                        (courier.code === 'shopvista' || courier.code === 'pickup'));

                    return (
                      <div
                        key={courier.code}
                        onClick={() => setSelectedCourierCode(courier.code)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="courier"
                            checked={isSelected}
                            onChange={() => setSelectedCourierCode(courier.code)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {courier.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                ({courier.service})
                              </span>
                              {isEligibleFree && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Bebas Ongkir
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Estimasi Tiba: {courier.etd} · {courier.description}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {isEligibleFree || courier.baseCost === 0 ? (
                            <span className="text-xs font-bold text-emerald-700 font-mono">
                              GRATIS
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {formatRupiah(courier.baseCost)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Payment & Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 3. Metode Pembayaran */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>Metode Pembayaran</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Gateway Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('payment_gateway')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'payment_gateway'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Payment Gateway Online (Midtrans / Xendit)</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Otomatis Lunas
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      GoPay, QRIS, DANA, ShopeePay, Kartu Kredit (Visa/Mastercard), Virtual Account
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer_bank')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'transfer_bank'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
                      <div className="text-xs font-bold text-slate-900">Transfer Manual</div>
                      <div className="text-[10px] text-slate-500">Upload bukti transfer</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600 mb-1" />
                      <div className="text-xs font-bold text-slate-900">Bayar di Tempat (COD)</div>
                      <div className="text-[10px] text-slate-500">Bayar tunai ke kurir</div>
                    </button>
                  </div>
                </div>

                {/* Info if Gateway */}
                {paymentMethod === 'payment_gateway' && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pembayaran Otomatis Instan</span>
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Setelah mengklik Buat Pesanan, popup gateway pembayaran akan terbuka untuk memilih GoPay, QRIS, Kartu Kredit, atau Virtual Account pilihan Anda.
                    </p>
                  </div>
                )}

                {/* Bank selection if transfer manual */}
                {paymentMethod === 'transfer_bank' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Pilih Rekening Tujuan:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {settings.bankAccounts.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                              selectedBank.id === b.id
                                ? 'bg-white border-emerald-600 text-emerald-800 shadow-xs'
                                : 'bg-white/80 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold">{b.bank}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Nomor Rekening {selectedBank.bank}
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-900">
                          {selectedBank.accountNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">{selectedBank.accountName}</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                      >
                        {copiedBank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">Ketentuan Cash On Delivery (COD):</p>
                    <p className="text-[11px] text-amber-700">
                      Harap siapkan uang tunai pas saat kurir tiba di alamat Anda. Paket boleh dibuka setelah pembayaran lunas diserahkan ke kurir.
                    </p>
                  </div>
                )}
              </div>

              {/* Kupon & Voucher Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kupon & Diskon Toko</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] underline"
                  >
                    Lihat Semua Kupon ({coupons.filter(c => c.isActive).length})
                  </button>
                </div>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-mono font-bold text-emerald-800">
                          {appliedVoucher.code}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {appliedVoucher.discountType === 'free_shipping'
                            ? 'Gratis Ongkos Kirim 100%'
                            : `Potongan ${formatRupiah(discountAmount)}`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ketik kode kupon..."
                      id="checkout-coupon-input"
                      className="flex-1 px-3 py-1.5 uppercase font-mono text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          'checkout-coupon-input'
                        ) as HTMLInputElement;
                        if (input && input.value) {
                          const res = applyVoucher(input.value, subtotal, baseShippingCost);
                          if (!res.success) {
                            alert(res.message);
                          } else {
                            input.value = '';
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Pakai
                    </button>
                  </div>
                )}
              </div>

              {/* Ringkasan Biaya Pesanan */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span>Ringkasan Belanja</span>
                  <span className="font-normal text-slate-500">
                    {cart.reduce((s, i) => s + i.quantity, 0)} item
                  </span>
                </h4>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk:</span>
                  <span className="font-mono">{formatRupiah(subtotal)}</span>
                </div>

                {discountAmount > 0 && !isCouponFreeShipping && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Kupon ({appliedVoucher?.code}):</span>
                    <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({selectedCourier.name}):</span>
                  {effectiveShippingCost === 0 ? (
                    <span className="font-mono font-bold text-emerald-700">GRATIS</span>
                  ) : (
                    <span className="font-mono">{formatRupiah(effectiveShippingCost)}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Pembayaran:</span>
                  <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-700">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>
                  {paymentMethod === 'payment_gateway'
                    ? 'Lanjut ke Pembayaran Online Gateway'
                    : 'Konfirmasi & Buat Pesanan'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaksi Terenkripsi & Dijamin 100% Aman</span>
              </div>
            </div>
          </div>
        </form>

        {/* Coupon Selector Modal */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Kupon Toko Tersedia</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {coupons
                  .filter(c => c.isActive)
                  .map(coupon => {
                    const isEligible = subtotal >= coupon.minPurchase;
                    const isSelected = appliedVoucher?.id === coupon.id;

                    return (
                      <div
                        key={coupon.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Exp: {coupon.expiryDate}
                          </span>
                        </div>

                        <p className="font-bold text-slate-900">{coupon.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {coupon.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            Min. Belanja: {formatRupiah(coupon.minPurchase)}
                          </span>

                          {isSelected ? (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Sedang Digunakan</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const res = applyVoucher(coupon.code, subtotal, baseShippingCost);
                                if (!res.success) {
                                  alert(res.message);
                                } else {
                                  setIsCouponModalOpen(false);
                                }
                              }}
                              disabled={!isEligible}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              {isEligible ? 'Gunakan Kupon' : 'Belum Memenuhi Min.'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
