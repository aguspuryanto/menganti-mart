import React from 'react';
import { ArrowRight, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { heroBannerImg } from '../data/mockData';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../utils/formatters';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  const { settings, applyVoucher } = useStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 md:py-16">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline and Call-to-Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="tracking-widest uppercase">E-Commerce Resmi 2026</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Garansi Orisinal 100%</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Gadget & Gaya Hidup Modern Pilihan Terbaik
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Nikmati pengalaman berbelanja terpercaya dengan pengiriman cepat dari ShopVista Express, JNE, SiCepat, dan J&T. Dukungan pelacakan resi live, pembayaran transfer bank otomatis, serta Cash on Delivery (COD).
            </p>

            {/* Promo voucher chip */}
            <div className="inline-flex items-center gap-3 p-2 pr-4 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold px-2.5 py-1 rounded-md">
                DISKONBARU10
              </span>
              <span className="text-slate-300 text-xs">
                Klaim diskon 10% untuk pesanan pertama Anda
              </span>
              <button
                onClick={() => {
                  applyVoucher('DISKONBARU10');
                  alert('Voucher DISKONBARU10 berhasil diterapkan ke keranjang Anda!');
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-auto"
              >
                Gunakan
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 group cursor-pointer"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Bebas Ongkir min. belanja {formatRupiah(settings.freeShippingMinAmount)}</span>
              </div>
            </div>

            {/* 3 Core Value Props */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">100% Original</div>
                  <div className="text-[11px] text-slate-400">Garansi resmi distributor</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Kirim Hari Ini</div>
                  <div className="text-[11px] text-slate-400">Order s/d 16:00 WIB</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-200">COD & Transfer</div>
                  <div className="text-[11px] text-slate-400">Mudah & Terverifikasi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
              <img
                src={heroBannerImg}
                alt="ShopVista Modern Lifestyle Showcase"
                className="w-full h-72 sm:h-84 lg:h-96 object-cover transform group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating micro info card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-3 rounded-xl flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Koleksi Unggulan
                  </span>
                  <div className="text-xs font-semibold text-white">Audio & Smart Wearable Studio</div>
                  <div className="text-[11px] text-slate-400">Tersedia pengiriman instan se-Jabodetabek</div>
                </div>
                <button
                  onClick={onExploreClick}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Beli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
