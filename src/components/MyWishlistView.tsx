import React, { useState, useMemo } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  Eye,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../utils/formatters';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

interface MyWishlistViewProps {
  onBackToStore: () => void;
}

export const MyWishlistView: React.FC<MyWishlistViewProps> = ({ onBackToStore }) => {
  const { wishlist, products, toggleWishlist, clearWishlist, addToCart, setIsCartOpen } = useStore();
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Filter products that are in the wishlist
  const wishlistProducts = useMemo(() => {
    const list = products.filter(p => wishlist.includes(p.id));
    if (sortBy === 'price-low') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list; // Preserves default order
  }, [products, wishlist, sortBy]);

  const totalWishlistValue = wishlistProducts.reduce((sum, p) => sum + p.price, 0);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    showNotification(`"${product.name}" telah ditambahkan ke keranjang.`);
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleMoveAllToCart = () => {
    let inStockCount = 0;
    wishlistProducts.forEach(prod => {
      if (prod.stock > 0) {
        addToCart(prod, 1);
        inStockCount++;
      }
    });

    if (inStockCount > 0) {
      showNotification(`${inStockCount} produk dari wishlist berhasil dimasukkan ke keranjang!`);
      setIsCartOpen(true);
    } else {
      showNotification('Produk dalam wishlist sedang kehabisan stok.', 'info');
    }
  };

  const handleConfirmClear = () => {
    clearWishlist();
    setIsConfirmingClear(false);
    showNotification('Seluruh isi wishlist Anda telah dikosongkan.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left font-sans animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          {notification.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {isConfirmingClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Kosongkan Wishlist?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Semua {wishlistProducts.length} produk tersimpan akan dihapus dari koleksi favorit Anda. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsConfirmingClear(false)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Koleksi Favorit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Wishlist Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlistProducts.length > 0 ? (
              <>
                Tersimpan <strong className="text-slate-800">{wishlistProducts.length} produk</strong> dengan estimasi nilai total <strong className="text-emerald-700 font-mono">{formatRupiah(totalWishlistValue)}</strong>
              </>
            ) : (
              'Simpan produk favorit Anda dan beli kapan saja saat Anda siap'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {wishlistProducts.length > 0 && (
            <>
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="newest">Urutan Tersimpan</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
              </div>

              <button
                onClick={handleMoveAllToCart}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Beli Semua ({wishlistProducts.length})</span>
              </button>

              <button
                onClick={() => setIsConfirmingClear(true)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Kosongkan Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onBackToStore}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>← Kembali Belanja</span>
          </button>
        </div>
      </div>

      {/* Wishlist Content */}
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 mt-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 stroke-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Wishlist Anda Masih Kosong</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Temukan produk idaman Anda di katalog dan klik ikon hati (wishlist) untuk menyimpannya di sini.
            </p>
          </div>
          <button
            onClick={onBackToStore}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            <span>Jelajahi Produk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {wishlistProducts.map(product => {
            const isAdded = !!addedIds[product.id];
            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductForModal(product)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
              >
                {/* Heart Toggle Button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                    showNotification(`"${product.name}" dihapus dari wishlist.`, 'info');
                  }}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm text-rose-500 hover:scale-110 transition-all cursor-pointer"
                  title="Hapus dari Wishlist"
                >
                  <Heart className="w-4 h-4 fill-current text-rose-500" />
                </button>

                {/* Product Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {product.discountPercent && product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded shadow-sm">
                      -{product.discountPercent}%
                    </div>
                  )}

                  {/* Hover Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      Detail Produk
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <span className="font-medium text-emerald-700">{product.categoryName}</span>
                      <span>·</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-semibold text-slate-700">{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>

                    <div className="mt-1 text-[11px] text-slate-400">
                      {product.stock <= 0 ? (
                        <span className="text-rose-500 font-semibold">Stok Habis</span>
                      ) : product.stock <= 5 ? (
                        <span className="text-amber-600 font-semibold">
                          Sisa {product.stock} unit!
                        </span>
                      ) : (
                        <span>Stok: {product.stock} unit</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm sm:text-base font-bold font-mono text-slate-900 tracking-tight">
                        {formatRupiah(product.price)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through font-mono">
                          {formatRupiah(product.originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={e => handleAddToCart(product, e)}
                      disabled={product.stock <= 0}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        product.stock <= 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                      title={product.stock <= 0 ? 'Stok sedang kosong' : 'Pindahkan ke Keranjang'}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Masuk</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Beli</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
};
