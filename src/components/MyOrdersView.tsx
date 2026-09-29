import React, { useState } from 'react';
import {
  Package,
  Truck,
  Printer,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Order } from '../types';

interface MyOrdersViewProps {
  onBackToStore: () => void;
  onOpenOrderConfirmation: (orderId: string) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  onBackToStore,
  onOpenOrderConfirmation,
}) => {
  const {
    currentUser,
    orders,
    setActiveTrackingOrder,
    setIsTrackingModalOpen,
    openThermalReceipt,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter orders for current user or all if guest
  const userOrders = orders.filter(o => {
    if (currentUser) {
      return (
        o.customerId === currentUser.id ||
        o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
    }
    return true;
  });

  const filtered = userOrders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.orderStatus === filterStatus;
  });

  const handleTrackLive = (order: Order) => {
    setActiveTrackingOrder(order);
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Pesanan Saya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status verifikasi pembayaran, nomor resi pengiriman, dan cetak invoice
          </p>
        </div>

        <button
          onClick={onBackToStore}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer w-fit"
        >
          ← Kembali Belanja
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Semua Pesanan' },
          { id: 'pending', label: 'Menunggu Bayar' },
          { id: 'processing', label: 'Diproses' },
          { id: 'shipped', label: 'Dalam Pengiriman' },
          { id: 'delivered', label: 'Selesai' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada riwayat pesanan</p>
          <p className="text-xs text-slate-400 mt-1">
            Pesanan yang Anda buat akan otomatis muncul di halaman ini.
          </p>
          <button
            onClick={onBackToStore}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Mulai Belanja Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {order.invoiceNumber}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      order.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.orderStatus === 'processing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.orderStatus === 'delivered'
                      ? '✓ Selesai'
                      : order.orderStatus === 'shipped'
                      ? '🚚 Dalam Pengiriman'
                      : order.orderStatus === 'processing'
                      ? '⏳ Sedang Dikemas'
                      : 'Menunggu Pembayaran'}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-slate-500 text-[11px]">
                          {item.quantity} x {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping & Payment Meta */}
              <div className="bg-slate-50 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Ekspedisi:</span>{' '}
                  <strong className="text-slate-800">{order.courierName}</strong>{' '}
                  <span className="text-[11px] text-slate-500">({order.courierService})</span>
                  {order.trackingNumber && (
                    <div className="mt-0.5">
                      <span className="text-slate-500">Resi:</span>{' '}
                      <span className="font-mono font-bold text-emerald-700">
                        {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-slate-500">Total Pembayaran:</div>
                  <div className="text-base font-extrabold font-mono text-emerald-700">
                    {formatRupiah(order.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {order.paymentMethod === 'transfer_bank' && order.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => onOpenOrderConfirmation(order.id)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Bukti Transfer</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleTrackLive(order)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lacak Pengiriman Live</span>
                  </button>

                  <button
                    onClick={() => openThermalReceipt(order)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cetak Resi Thermal</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
