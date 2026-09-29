import React from 'react';
import { Truck, ShieldCheck, CreditCard, MessageCircle, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onCategorySelect: (catId: string) => void;
  onOpenTracking: () => void;
  onOpenWishlist?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySelect, onOpenTracking, onOpenWishlist }) => {
  const { settings, categories, wishlist } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base">
                SV
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {settings.slogan}. Belanja nyaman dengan integrasi kurir lengkap, nomor resi otomatis, serta jaminan barang 100% original.
            </p>

            <div className="text-xs space-y-1 text-slate-400">
              <p>
                <strong className="text-slate-300">Alamat Warehouse:</strong> {settings.address}, {settings.city} {settings.postalCode}
              </p>
              <p>
                <strong className="text-slate-300">Hotline:</strong> {settings.phoneNumber}
              </p>
              <p>
                <strong className="text-slate-300">WhatsApp CS:</strong> +{settings.whatsappNumber}
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Kategori Produk
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategorySelect(cat.id)}
                    className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan & Bantuan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Layanan Pelanggan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Lacak Status Resi Live</span>
                </button>
              </li>
              {onOpenWishlist && (
                <li>
                  <button
                    onClick={onOpenWishlist}
                    className="hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    <span>Wishlist Saya ({wishlist.length})</span>
                  </button>
                </li>
              )}
              <li>
                <span className="text-slate-400">Bebas Ongkir min. Rp 100.000</span>
              </li>
              <li>
                <span className="text-slate-400">Garansi Toko 100% Ganti Baru</span>
              </li>
              <li>
                <span className="text-slate-400">Ketentuan COD (Bayar di Tempat)</span>
              </li>
            </ul>
          </div>

          {/* Partners: Couriers & Payment */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Ekspedisi Pengiriman
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-300">
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  ShopVista Express
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  JNE Express
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  J&T Express
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  SiCepat Ekspres
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Metode Pembayaran
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-300">
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  BCA
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  Mandiri
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  BRI
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  BNI
                </span>
                <span className="bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  COD (Bayar di Tempat)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 {settings.storeName}. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <span>Standar Resi Thermal 100mm × 165mm</span>
            <span>·</span>
            <span>Real-time Courier Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
