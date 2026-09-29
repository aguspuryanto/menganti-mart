import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  Check,
  ThumbsUp,
  MessageSquarePlus,
  BadgeCheck,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Product } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const {
    addToCart,
    setIsCartOpen,
    setIsCheckoutOpen,
    currentUser,
    getProductReviews,
    addReview,
    voteHelpful,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Review Form States
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Reviews for this product
  const productReviews = getProductReviews(product.id, false);

  // Calculate rating breakdown
  const totalReviews = productReviews.length;
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(r => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      productId: product.id,
      productName: product.name,
      userId: currentUser?.id || `usr_guest_${Date.now()}`,
      userName: currentUser?.name || 'Pelanggan Terverifikasi',
      userEmail: currentUser?.email || 'customer@example.com',
      rating: newRating,
      title: reviewTitle.trim() || 'Ulasan Produk',
      comment: reviewComment.trim(),
      isVerifiedBuyer: true,
    });

    setReviewTitle('');
    setReviewComment('');
    setIsWritingReview(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 relative text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Product Showcase & Purchase Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 border-b border-slate-100">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {product.discountPercent && product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
                  HEMAT {product.discountPercent}%
                </div>
              )}

              {/* Heart Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                  isInWishlist(product.id)
                    ? 'bg-white text-rose-500 scale-105'
                    : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500'
                }`}
                title={isInWishlist(product.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isInWishlist(product.id) ? 'fill-current text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-800">100% Asli</span>
                <span className="text-[10px] text-slate-400">Garansi Toko</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-800">Kirim Cepat</span>
                <span className="text-[10px] text-slate-400">1-2 Hari Kerja</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                <span className="font-mono font-bold text-emerald-600 text-xs mt-0.5 mb-0.5">
                  {(product.weight / 1000).toFixed(1)} kg
                </span>
                <span className="font-semibold text-slate-800">Bobot Paket</span>
                <span className="text-[10px] text-slate-400">{product.weight} gram</span>
              </div>
            </div>
          </div>

          {/* Right: Product Purchase Module */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-medium text-emerald-700">{product.categoryName}</span>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold text-slate-700">{product.rating}</span>
                </div>
                <span aria-hidden="true">·</span>
                <span>{totalReviews || product.reviewsCount} Ulasan Pembeli</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {formatRupiah(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatRupiah(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2 text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 font-medium">
                    Tersedia {product.stock} unit siap dikirim
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">Stok Habis</span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Deskripsi Produk
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-28 overflow-y-auto pr-1">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specs && product.specs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Spesifikasi Utama
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">{spec.label}:</span>
                        <span className="font-semibold text-slate-800 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Jumlah:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-900 min-w-8 text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400 ml-auto font-mono">
                  Subtotal: {formatRupiah(product.price * quantity)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Masuk Keranjang!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Tambah Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:bg-slate-300"
                >
                  <span>Beli Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: PRODUCT REVIEWS & RATINGS */}
        <div className="p-6 sm:p-8 bg-slate-50/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Ulasan & Penilaian Pembeli
              </h3>
              <p className="text-xs text-slate-500">
                Ulasan jujur dari pembeli terverifikasi ShopVista
              </p>
            </div>

            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer w-fit"
            >
              <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
              <span>{isWritingReview ? 'Tutup Form Ulasan' : 'Tulis Ulasan Produk'}</span>
            </button>
          </div>

          {reviewSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Terima kasih! Ulasan Anda telah berhasil dipublikasikan.</span>
            </div>
          )}

          {/* Interactive Review Writing Form */}
          {isWritingReview && (
            <form
              onSubmit={handleReviewSubmit}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 text-xs animate-in fade-in"
            >
              <h4 className="font-bold text-slate-900 text-sm">
                Bagikan Pengalaman Anda Mengenai Produk Ini
              </h4>

              {/* Star selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Beri Bintang Kepuasan *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {newRating === 5
                      ? '5.0 - Sangat Puas'
                      : newRating === 4
                      ? '4.0 - Puas'
                      : newRating === 3
                      ? '3.0 - Cukup'
                      : newRating === 2
                      ? '2.0 - Kurang'
                      : '1.0 - Kecewa'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Judul Ulasan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Suara mantap, ANC kedap sekali!"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ulasan Lengkap Anda *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ceritakan detail performa, kenyamanan, atau pengiriman produk..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Ulasan Anda akan langsung muncul dengan label Pembeli Terverifikasi
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Rating Summary Breakdown Box */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-white p-5 rounded-2xl border border-slate-200">
            {/* Average Score */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center sm:border-r border-slate-100 sm:pr-6 text-center">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
                {product.rating}
              </span>
              <div className="flex items-center gap-1 text-amber-400 my-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Berdasarkan {totalReviews || product.reviewsCount} penilaian
              </span>
            </div>

            {/* Distribution Bars */}
            <div className="sm:col-span-8 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingCounts[stars] || 0;
                const percentage =
                  totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 85 : 15;

                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 text-slate-600 font-semibold text-[11px]">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {productReviews.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              productReviews.map(rev => (
                <div
                  key={rev.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-[10px]">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{rev.userName}</span>
                      {rev.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span>Pembeli Terverifikasi</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-slate-700 font-bold ml-1">{rev.title}</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs">{rev.comment}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-50 text-[11px]">
                    <button
                      onClick={() => voteHelpful(rev.id)}
                      className="text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Membantu ({rev.helpfulVotes})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
