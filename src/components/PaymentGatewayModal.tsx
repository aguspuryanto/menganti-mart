import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Lock,
  ArrowRight,
  RefreshCw,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { PaymentGatewayChannel } from '../types';
import { formatRupiah } from '../utils/formatters';

export const PaymentGatewayModal: React.FC = () => {
  const {
    isGatewayModalOpen,
    activeGatewayOrder,
    closePaymentGateway,
    handleGatewayCallback,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'qris_ewallet' | 'credit_card' | 'virtual_account'>(
    'qris_ewallet'
  );
  const [selectedChannel, setSelectedChannel] = useState<PaymentGatewayChannel>('qris');

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState('JOHN DOE');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpPromptOpen, setOtpPromptOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [copiedVa, setCopiedVa] = useState(false);

  if (!isGatewayModalOpen || !activeGatewayOrder) return null;

  const vaNumberMap: Record<string, string> = {
    bca_va: '80777' + activeGatewayOrder.invoiceNumber.replace(/\D/g, '').slice(-8),
    mandiri_va: '89100' + activeGatewayOrder.invoiceNumber.replace(/\D/g, '').slice(-8),
    bni_va: '98800' + activeGatewayOrder.invoiceNumber.replace(/\D/g, '').slice(-8),
    bri_va: '12800' + activeGatewayOrder.invoiceNumber.replace(/\D/g, '').slice(-8),
  };

  const currentVaNumber = vaNumberMap[selectedChannel] || vaNumberMap['bca_va'];

  const handleCopyVa = () => {
    navigator.clipboard.writeText(currentVaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleSimulateSuccess = (channel: PaymentGatewayChannel = selectedChannel) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOtpPromptOpen(false);
      handleGatewayCallback(activeGatewayOrder.id, 'success', channel);
      closePaymentGateway();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        /* ignore */
      }
    }, 1200);
  };

  const handleSimulateFailure = (channel: PaymentGatewayChannel = selectedChannel) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOtpPromptOpen(false);
      handleGatewayCallback(activeGatewayOrder.id, 'failed', channel);
      closePaymentGateway();
    }, 1000);
  };

  const handleCardPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpPromptOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-left flex flex-col max-h-[95vh] animate-in fade-in duration-200">
        {/* Header - Midtrans / Xendit Styled Snap Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  ShopVista Pay Gateway
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded">
                  Midtrans / Xendit Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                {activeGatewayOrder.invoiceNumber} · Tagihan:{' '}
                <strong className="text-white font-mono">
                  {formatRupiah(activeGatewayOrder.totalAmount)}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={closePaymentGateway}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Channel Navigation */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('qris_ewallet');
              setSelectedChannel('qris');
            }}
            className={`py-2 px-1 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qris_ewallet'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>QRIS & E-Wallet</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('credit_card');
              setSelectedChannel('credit_card');
            }}
            className={`py-2 px-1 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'credit_card'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kartu Kredit</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('virtual_account');
              setSelectedChannel('bca_va');
            }}
            className={`py-2 px-1 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'virtual_account'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Virtual Account</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* 1. QRIS & E-WALLET TAB */}
          {activeTab === 'qris_ewallet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'qris', name: 'QRIS', icon: '📱' },
                  { id: 'gopay', name: 'GoPay', icon: '🟢' },
                  { id: 'dana', name: 'DANA', icon: '🔵' },
                  { id: 'shopeepay', name: 'ShopeePay', icon: '🟠' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedChannel(item.id as PaymentGatewayChannel)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedChannel === item.id
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-base mb-0.5">{item.icon}</div>
                    <div className="text-[11px] truncate">{item.name}</div>
                  </button>
                ))}
              </div>

              {/* Dynamic QRIS Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200">
                  <span>Merchant: ShopVista Official</span>
                  <span className="text-emerald-700 font-bold font-mono">Batas Waktu: 14:59</span>
                </div>

                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex flex-col justify-between items-center">
                  <div className="text-[9px] font-bold tracking-widest text-slate-400">
                    QRIS NASIONAL STANDAR BI
                  </div>
                  {/* Visual QR Pattern */}
                  <div className="w-36 h-36 border border-slate-400 p-1 grid grid-cols-6 grid-rows-6 gap-0.5">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-2xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30
                            ? 'bg-slate-900'
                            : i % 4 === 0
                            ? 'bg-slate-800'
                            : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-bold text-emerald-700 font-mono">
                    NMID: ID102938475812
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  Buka aplikasi <strong>BCA, GoPay, OVO, DANA, Livin, atau Shopee</strong>, lalu scan kode QR di atas.
                </div>
              </div>

              {/* Action Simulation Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleSimulateSuccess(selectedChannel)}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Berhasil (Settlement)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSimulateFailure(selectedChannel)}
                  disabled={isProcessing}
                  className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-semibold text-[11px] transition-colors"
                >
                  Simulasikan Pembayaran Ditolak / Kadaluarsa
                </button>
              </div>
            </div>
          )}

          {/* 2. KARTU KREDIT TAB */}
          {activeTab === 'credit_card' && (
            <div className="space-y-4">
              {/* Virtual Credit Card Preview */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-xl shadow-md border border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>SHOPVISTA PLATINUM</span>
                  <span className="font-bold text-emerald-400">VISA / MASTERCARD</span>
                </div>
                <div className="font-mono text-base tracking-widest font-bold py-1">
                  {cardNumber}
                </div>
                <div className="flex justify-between items-end text-[10px]">
                  <div>
                    <div className="text-slate-400 uppercase text-[8px]">Cardholder</div>
                    <div className="font-bold uppercase tracking-wider">{cardHolder}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase text-[8px]">Valid Thru</div>
                    <div className="font-mono font-bold">{cardExpiry}</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCardPaymentSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Kartu Kredit
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Masa Berlaku (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode CVV (3 Angka)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(activeGatewayOrder.totalAmount)})</span>
                </button>
              </form>

              {/* 3D Secure OTP Simulator Popup */}
              {otpPromptOpen && (
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Otorisasi 3D Secure Bank (OTP)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Kode OTP simulasi telah dikirim ke nomor HP Anda. Masukkan <strong>123456</strong> atau klik langsung konfirmasi:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-center font-bold tracking-widest text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleSimulateSuccess('credit_card')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Konfirmasi OTP & Bayar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. VIRTUAL ACCOUNT TAB */}
          {activeTab === 'virtual_account' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bca_va', name: 'BCA VA' },
                  { id: 'mandiri_va', name: 'Mandiri VA' },
                  { id: 'bni_va', name: 'BNI VA' },
                  { id: 'bri_va', name: 'BRI VA' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedChannel(item.id as PaymentGatewayChannel)}
                    className={`py-2 px-1 rounded-xl border text-center font-bold transition-all ${
                      selectedChannel === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* VA Code Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Nomor Virtual Account ({selectedChannel.toUpperCase()})
                </span>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {currentVaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVa}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedVa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVa ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  Transfer dapat dilakukan lewat ATM, Mobile Banking (m-BCA / Livin / BRImo / BNI Mobile), atau Internet Banking tanpa biaya admin tambahan.
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleSimulateSuccess(selectedChannel)}
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulasi Transfer Berhasil (Lunas)</span>
                </button>

                <button
                  onClick={() => handleSimulateFailure(selectedChannel)}
                  disabled={isProcessing}
                  className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-semibold text-[11px] transition-colors"
                >
                  Simulasikan Kadaluarsa / Gagal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 sm:px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted Payment Gateway</span>
          </div>
          <button
            onClick={closePaymentGateway}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
