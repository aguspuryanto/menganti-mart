import React, { useState } from 'react';
import { MessageCircle, X, Send, ExternalLink, Bot, CheckCheck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  id: string;
  sender: 'cs' | 'user';
  text: string;
  time: string;
}

export const WhatsAppLiveWidget: React.FC = () => {
  const { settings, setIsTrackingModalOpen } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'cs',
      text: 'Halo! Selamat datang di ShopVista Official Store. Ada yang bisa kami bantu seputar ketersediaan stok, info pengiriman, atau konfirmasi transfer bank?',
      time: 'Baru saja',
    },
  ]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Simulated Smart Indonesian CS reply
    setTimeout(() => {
      let reply = 'Terima kasih atas pertanyaannya! Tim admin kami akan segera membantu Anda.';
      const lower = text.toLowerCase();

      if (lower.includes('resi') || lower.includes('lacak') || lower.includes('paket')) {
        reply =
          'Untuk melacak paket pesanan secara real-time, Anda dapat mengklik tombol "Lacak Resi" di menu atas atau memasukkan nomor resi seperti SVX892019482ID di popup pelacakan!';
      } else if (lower.includes('stok') || lower.includes('ready') || lower.includes('barang')) {
        reply =
          'Semua produk yang bertanda "Tersedia" di katalog kami ready stock di gudang Jakarta dan siap dikirim hari ini sebelum pukul 16:00 WIB!';
      } else if (lower.includes('transfer') || lower.includes('bayar') || lower.includes('bca') || lower.includes('bukti')) {
        reply =
          'Setelah melakukan transfer ke rekening resmi BCA / Mandiri / BRI ShopVista, Anda dapat langsung mengunggah foto bukti pembayaran di menu rincian pesanan untuk verifikasi otomatis.';
      } else if (lower.includes('cod') || lower.includes('bayar di tempat')) {
        reply =
          'Ya, kami mendukung COD (Cash on Delivery). Anda cukup memilih opsi COD saat checkout dan siapkan uang pas saat kurir tiba di alamat Anda.';
      } else if (lower.includes('ongkir') || lower.includes('gratis')) {
        reply =
          'ShopVista memberikan fasilitas Bebas Ongkir otomatis untuk pembelanjaan minimal Rp 100.000 dengan kurir ShopVista Express!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `cs_${Date.now()}`,
          sender: 'cs',
          text: reply,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 800);
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  const openDirectWhatsApp = () => {
    const encoded = encodeURIComponent(
      'Halo Admin ShopVista, saya ingin konsultasi produk dan pesanan di website.'
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          aria-label="Konsultasi WhatsApp"
        >
          {/* Online green indicator dot */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-emerald-600"></span>
          </span>

          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            Chat WhatsApp CS
          </span>
        </button>
      )}

      {/* Expanded Live Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-200 text-left">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-sm shadow-xs">
                  SV
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Customer Support</h4>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>Online</span>
                  <span>·</span>
                  <span>Respon dalam ~1 menit</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="bg-slate-50 p-2.5 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickQuestion('Tanya ketersediaan stok produk')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full whitespace-nowrap text-slate-700 transition-colors"
            >
              📦 Cek Stok
            </button>
            <button
              onClick={() => handleQuickQuestion('Bagaimana cara lacak nomor resi?')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full whitespace-nowrap text-slate-700 transition-colors"
            >
              🚚 Lacak Resi
            </button>
            <button
              onClick={() => handleQuickQuestion('Konfirmasi transfer pembayaran')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full whitespace-nowrap text-slate-700 transition-colors"
            >
              💳 Konfirmasi Transfer
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>
            ))}
          </div>

          {/* Input & Direct WA Button */}
          <div className="p-3 border-t border-slate-200 bg-white space-y-2">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ketik pertanyaan Anda..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={openDirectWhatsApp}
              className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka WhatsApp Resmi (+{settings.whatsappNumber})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
