import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Truck,
  Printer,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../utils/formatters';

interface OrderConfirmationModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderId,
  onClose,
}) => {
  const {
    orders,
    uploadPaymentProof,
    setIsTrackingModalOpen,
    setActiveTrackingOrder,
    openThermalReceipt,
  } = useStore();

  const [copiedBank, setCopiedBank] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!orderId) return null;

  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  const handleCopyAccount = () => {
    if (order.selectedBank) {
      navigator.clipboard.writeText(order.selectedBank.accountNumber.replace(/\s+/g, ''));
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // Handle image upload from file or sample
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setProofPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    // Generate a clean placeholder proof for fast testing
    const sample = `https://placehold.co/600x800/10b981/ffffff?text=BUKTI+TRANSFER+${order.selectedBank?.bank || 'BCA'}+LUNAS+${order.invoiceNumber}`;
    setProofPreviewUrl(sample);
  };

  const handleSaveProof = () => {
    if (!proofPreviewUrl) return;
    setIsUploading(true);
    setTimeout(() => {
      uploadPaymentProof(order.id, proofPreviewUrl);
      setIsUploading(false);
      setUploadSuccess(true);
    }, 600);
  };

  const handleTrackLive = () => {
    setActiveTrackingOrder(order);
    setIsTrackingModalOpen(true);
    onClose();
  };

  const handlePrintReceipt = () => {
    openThermalReceipt(order);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden text-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pesanan Berhasil Dibuat!
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                No. Invoice: {order.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Order Brief */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Transaksi:</span>
              <span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Penerima & Alamat:</span>
              <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                {order.customerName} ({order.shippingAddress}, {order.destinationCity})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kurir Pengiriman:</span>
              <span className="font-semibold text-slate-800">
                {order.courierName} ({order.courierService})
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-900">Total Tagihan:</span>
              <span className="text-base font-extrabold font-mono text-emerald-700">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Instructions if Transfer Bank */}
          {order.paymentMethod === 'transfer_bank' && order.selectedBank && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Instruksi Pembayaran Transfer Bank
                </h4>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Bank Tujuan Transfer ({order.selectedBank.bank})
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {order.selectedBank.accountNumber}
                  </div>
                  <div className="text-xs text-slate-600">{order.selectedBank.accountName}</div>
                </div>

                <button
                  onClick={handleCopyAccount}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? 'Tersalin!' : 'Salin No. Rekening'}</span>
                </button>
              </div>

              {/* Upload Payment Proof Section */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Unggah Bukti Transfer:</span>
                  {order.paymentStatus === 'paid' && (
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      ✓ Pembayaran Lunas
                    </span>
                  )}
                  {order.paymentStatus === 'verification_pending' && (
                    <span className="text-amber-700 font-semibold text-[11px]">
                      ⏳ Menunggu Verifikasi Admin
                    </span>
                  )}
                </div>

                {uploadSuccess || order.paymentProofUrl ? (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Bukti transfer tersimpan! Admin akan segera memverifikasi.</span>
                    </div>
                    {order.paymentProofUrl && (
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pilih Foto Bukti Bayar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleUseSampleProof}
                        className="px-2.5 py-2 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Gunakan Contoh Bukti Cepat
                      </button>
                    </div>

                    {proofPreviewUrl && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-3">
                        <img
                          src={proofPreviewUrl}
                          alt="Bukti Transfer Preview"
                          className="w-14 h-14 object-cover rounded border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            Foto bukti transfer siap dikirim
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Klik tombol di bawah untuk verifikasi ke admin
                          </p>
                        </div>
                        <button
                          onClick={handleSaveProof}
                          disabled={isUploading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        >
                          {isUploading ? 'Menyimpan...' : 'Kirim Bukti'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {order.paymentMethod === 'cod' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-amber-900">Metode Pembayaran: COD (Bayar di Tempat)</div>
              <p className="text-amber-800">
                Pesanan Anda akan segera disiapkan oleh tim gudang ShopVista. Pastikan Anda berada di alamat pengiriman saat kurir tiba dan siapkan uang pas sebesar{' '}
                <strong className="font-mono">{formatRupiah(order.totalAmount)}</strong>.
              </p>
            </div>
          )}

          {/* Quick Tracking Status Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Status Pesanan:</span>
              <span className="font-semibold text-emerald-700 uppercase tracking-wide">
                {order.orderStatus === 'pending'
                  ? 'Menunggu Konfirmasi'
                  : order.orderStatus === 'processing'
                  ? 'Diproses di Gudang'
                  : order.orderStatus === 'shipped'
                  ? 'Dalam Pengiriman'
                  : 'Selesai'}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Nomor Resi Pengiriman:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleTrackLive}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Lacak Status Live</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Resi Thermal</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
