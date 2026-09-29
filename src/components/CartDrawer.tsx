import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    coupons,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    calculateCouponDiscount,
    settings,
    setIsCheckoutOpen,
  } = useStore();

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Discount calculation
  const discountAmount = calculateCouponDiscount(appliedVoucher, subtotal, 15000);
  const isCouponFreeShipping = appliedVoucher?.discountType === 'free_shipping';
  const finalTotal = Math.max(0, subtotal - (isCouponFreeShipping ? 0 : discountAmount));

  // Free shipping progress
  const freeShippingThreshold = settings.freeShippingMinAmount;
  const freeShippingNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    if (!voucherInput.trim()) return;

    const res = applyVoucher(voucherInput, subtotal, 15000);
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setVoucherInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Keranjang Belanja</h3>
              <span className="text-xs text-slate-500 font-mono">
                ({cart.reduce((s, i) => s + i.quantity, 0)} item)
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="bg-emerald-50/70 p-3 sm:px-5 border-b border-emerald-100 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Truck className="w-3.5 h-3.5" />
                {freeShippingNeeded === 0 ? (
                  <span>Selamat! Anda berhak Bebas Ongkir ShopVista Express</span>
                ) : (
                  <span>
                    Tambah <strong className="font-mono">{formatRupiah(freeShippingNeeded)}</strong> lagi untuk Bebas Ongkir!
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-emerald-700">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Keranjang belanja kosong</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Temukan headphone, smartwatch, atau perlengkapan impian Anda di katalog kami.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-colors"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-[10px] text-emerald-700 font-medium truncate">
                        {item.product.categoryName}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                        {formatRupiah(item.product.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
              {/* Voucher Code Form */}
              {appliedVoucher ? (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Voucher <strong className="font-mono">{appliedVoucher.code}</strong> aktif!
                    </span>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Punya voucher? (Coba: DISKONBARU10)"
                        value={voucherInput}
                        onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </form>
                  {voucherError && (
                    <p className="text-[11px] text-rose-600 mt-1">{voucherError}</p>
                  )}
                </div>
              )}

              {/* Price Calculation Summary */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Produk:</span>
                  <span className="font-mono">{formatRupiah(subtotal)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Kupon ({appliedVoucher.code}):</span>
                    <span className="font-mono">
                      {isCouponFreeShipping
                        ? 'Bebas Ongkir 100%'
                        : `-${formatRupiah(discountAmount)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Estimasi:</span>
                  <span className="font-mono text-emerald-700">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
