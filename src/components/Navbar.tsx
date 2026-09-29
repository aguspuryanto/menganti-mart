import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Store,
  Menu,
  X,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../utils/formatters';

interface NavbarProps {
  currentView: 'store' | 'admin' | 'my-orders' | 'wishlist';
  setCurrentView: (view: 'store' | 'admin' | 'my-orders' | 'wishlist') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const {
    currentUser,
    cart,
    wishlist,
    setIsCartOpen,
    setIsAuthModalOpen,
    setIsTrackingModalOpen,
    logout,
    quickLogin,
    settings,
    categories,
    orders,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Count pending verification orders for admin badge
  const pendingOrdersCount = orders.filter(
    o => o.paymentStatus === 'verification_pending' || o.orderStatus === 'processing'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Bebas Ongkir Otomatis untuk pesanan minimal {formatRupiah(settings.freeShippingMinAmount)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>WhatsApp CS: {settings.phoneNumber}</span>
            <span>·</span>
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="text-slate-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lacak Resi Pengiriman</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentView('store');
                setSelectedCategory('all');
              }}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
                SV
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  ShopVista
                </span>
                <span className="hidden lg:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  Official Store
                </span>
              </div>
            </button>

            {/* Quick category links (desktop) */}
            {currentView === 'store' && (
              <nav className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-600">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Semua Produk
                </button>
                {categories.slice(0, 3).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      selectedCategory === cat.id
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Search bar (Zone 2) */}
          {currentView === 'store' && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari headphone, smartwatch, keyboard..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons (Zone 3) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Tracking Button */}
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Lacak Resi Pengiriman"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Lacak Resi</span>
            </button>

            {/* Wishlist Button */}
            {currentView !== 'admin' && (
              <button
                onClick={() => setCurrentView('wishlist')}
                className={`relative p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  currentView === 'wishlist'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100'
                }`}
                aria-label="Wishlist Saya"
                title="Wishlist Saya"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {wishlist.length}
                  </span>
                )}
                <span className="hidden lg:inline">Wishlist</span>
              </button>
            )}

            {/* Cart Button */}
            {currentView !== 'admin' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                aria-label="Keranjang Belanja"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartTotalItems}
                  </span>
                )}
                <span className="hidden md:inline font-mono">
                  {cart.length > 0 &&
                    formatRupiah(
                      cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
                    )}
                </span>
              </button>
            )}

            {/* View Switcher: Store vs Admin Dashboard */}
            {currentUser?.role === 'admin' ? (
              currentView === 'admin' ? (
                <button
                  onClick={() => setCurrentView('store')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Lihat Toko</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="relative px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Dashboard</span>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              )
            ) : null}

            {/* User Account / Role dropdown */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {currentUser.role === 'admin' ? 'Super Admin' : 'Pelanggan'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Role: {currentUser.role === 'admin' ? 'Admin Toko' : 'Pelanggan'}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setCurrentView('store');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>Katalog Toko</span>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('wishlist');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>Wishlist Saya</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="font-mono text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded font-bold">
                              {wishlist.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('my-orders');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Riwayat Pesanan Saya</span>
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setCurrentView('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Buka Admin Dashboard</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        {/* 1-Click Fast Switch for testing */}
                        <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          Uji Coba Akun:
                        </div>
                        <div className="px-3 flex gap-1.5 pb-2">
                          <button
                            onClick={() => {
                              quickLogin('admin');
                              setCurrentView('admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex-1 py-1 px-2 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-center transition-colors"
                          >
                            Switch Admin
                          </button>
                          <button
                            onClick={() => {
                              quickLogin('customer');
                              setCurrentView('store');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex-1 py-1 px-2 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-center transition-colors"
                          >
                            Switch John
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {currentView === 'store' && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari produk di ShopVista..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-transparent focus:border-emerald-500 rounded-lg outline-none"
              />
            </div>
          </div>
        )}

        {/* Mobile drawer menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setCurrentView('store');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Katalog Produk</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('wishlist');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>Wishlist Saya</span>
              </div>
              {wishlist.length > 0 && (
                <span className="font-mono text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setCurrentView('my-orders');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Pesanan Saya</span>
            </button>
            <button
              onClick={() => {
                setIsTrackingModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Cek Resi Pengiriman Live</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Buka Admin Dashboard</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
