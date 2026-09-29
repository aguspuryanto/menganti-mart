import React, { useState } from 'react';
import { Mail, Check, Sparkles, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';

export const NewsletterBanner: React.FC = () => {
  const { applyVoucher } = useStore();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubscribed(true);
    applyVoucher('DISKONBARU10');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      /* ignore */
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('DISKONBARU10');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="py-12 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Keuntungan Member Baru</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Dapatkan Diskon 10% untuk Belanja Pertama Anda
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Daftarkan email Anda untuk menerima informasi flash sale, rilisan produk gadget terbaru, dan kode promo eksklusif mingguan.
        </p>

        {isSubscribed ? (
          <div className="max-w-md mx-auto p-4 bg-slate-800/90 border border-emerald-500/40 rounded-2xl text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
              <Check className="w-4 h-4" />
              <span>Selamat! Email {email} Berhasil Terdaftar</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-slate-300">Gunakan Voucher:</span>
              <span className="font-mono font-bold text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded">
                DISKONBARU10
              </span>
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-semibold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Masukkan alamat email Anda..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-400 text-white placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Klaim Diskon
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
