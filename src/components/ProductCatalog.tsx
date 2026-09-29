import React, { useState, useMemo } from 'react';
import { ShoppingBag, Star, Eye, Check, SlidersHorizontal, Sparkles, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { useStore } from '../context/StoreContext';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCatalogProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
}

type SortOption = 'popular' | 'price-low' | 'price-high' | 'discount';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { products, categories, addToCart, wishlist, toggleWishlist, isInWishlist } = useStore();
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.rating * b.reviewsCount - a.rating * a.reviewsCount);
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section id="katalog-produk" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Catalog Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koleksi Terverifikasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Katalog Produk Pilihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Menampilkan {filteredProducts.length} dari total {products.length} produk
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Urutkan:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none focus:border-emerald-500 transition-colors shadow-xs"
          >
            <option value="popular">Paling Populer & Terlaris</option>
            <option value="price-low">Harga: Rendah ke Tinggi</option>
            <option value="price-high">Harga: Tinggi ke Rendah</option>
            <option value="discount">Diskon Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Category Segmented Filter Tabs */}
      <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Semua Kategori ({products.length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Active Search Filter Badge */}
      {searchQuery && (
        <div className="flex items-center gap-2 py-2 text-xs text-slate-600">
          <span>Menampilkan hasil pencarian untuk:</span>
          <span className="font-semibold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
            "{searchQuery}"
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-emerald-700 hover:underline font-medium"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
          <p className="text-base font-semibold text-slate-800">
            Tidak ada produk yang cocok dengan pencarian Anda
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba kata kunci lain atau pilih kategori produk yang berbeda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Lihat Semua Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 mt-6">
          {filteredProducts.map(product => {
            const isAdded = !!addedIds[product.id];
            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductForModal(product)}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Product Image Lead (65-75% visual weight) */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Discount tag */}
                  {product.discountPercent && product.discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded shadow-sm">
                      -{product.discountPercent}%
                    </div>
                  )}

                  {/* Heart Wishlist Toggle Button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      isInWishlist(product.id)
                        ? 'bg-white text-rose-500 shadow-md scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs'
                    }`}
                    title={
                      isInWishlist(product.id)
                        ? 'Hapus dari Wishlist'
                        : 'Simpan ke Wishlist'
                    }
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isInWishlist(product.id) ? 'fill-current text-rose-500' : ''
                      }`}
                    />
                  </button>

                  {/* Featured badge */}
                  {product.isFeatured && (
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Unggulan
                    </div>
                  )}

                  {/* Hover Quick View Button */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      Detail Produk
                    </span>
                  </div>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    {/* Quiet Unboxed Metadata (Zero-pill discipline) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-emerald-700">{product.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-semibold text-slate-700">{product.rating}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <span>({product.reviewsCount})</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>

                    {/* Stock note */}
                    <div className="mt-1 text-[11px] text-slate-400">
                      {product.stock <= 5 ? (
                        <span className="text-amber-600 font-semibold">
                          Sisa {product.stock} unit lagi!
                        </span>
                      ) : (
                        <span>Stok: {product.stock} unit</span>
                      )}
                    </div>
                  </div>

                  {/* Price and Add Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base sm:text-lg font-bold font-mono text-slate-900 tracking-tight">
                        {formatRupiah(product.price)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-[11px] text-slate-400 line-through font-mono">
                          {formatRupiah(product.originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={e => handleQuickAdd(product, e)}
                      disabled={product.stock <= 0}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                      title="Tambah ke Keranjang"
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
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
    </section>
  );
};
