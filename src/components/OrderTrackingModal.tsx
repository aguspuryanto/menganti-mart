import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Printer,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    activeTrackingOrder,
    setActiveTrackingOrder,
    findOrderByTracking,
    orders,
    openThermalReceipt,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isTrackingModalOpen) return null;

  // Selected order to track: either activeTrackingOrder or default to the most recent shipped order
  const displayOrder: Order | null =
    activeTrackingOrder ||
    orders.find(o => o.orderStatus === 'shipped' && o.trackingNumber) ||
    orders[0] ||
    null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!searchInput.trim()) return;

    const found = findOrderByTracking(searchInput.trim());
    if (found) {
      setActiveTrackingOrder(found);
      setSearchInput('');
    } else {
      setErrorMessage(
        `Nomor resi atau invoice "${searchInput}" tidak ditemukan. Silakan periksa kembali.`
      );
    }
  };

  const handleSelectSampleResi = (sampleResi: string) => {
    const found = findOrderByTracking(sampleResi);
    if (found) {
      setActiveTrackingOrder(found);
      setErrorMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pelacakan Resi Pengiriman Live
              </h3>
              <p className="text-[11px] text-slate-400">
                Lacak pergerakan paket pesanan ekspedisi secara real-time
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Tracking Search Form */}
          <div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Masukkan Nomor Resi (misal: SVX892019482ID) atau No. Invoice"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Cari Resi
              </button>
            </form>

            {/* Quick sample chips for one-click testing */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-slate-500">
              <span>Coba Demo Resi:</span>
              <button
                type="button"
                onClick={() => handleSelectSampleResi('SVX892019482ID')}
                className="font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
              >
                SVX892019482ID (ShopVista Express)
              </button>
              <button
                type="button"
                onClick={() => handleSelectSampleResi('SCP902198421ID')}
                className="font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
              >
                SCP902198421ID (SiCepat)
              </button>
            </div>

            {errorMessage && (
              <div className="mt-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {displayOrder ? (
            <div className="space-y-4">
              {/* Shipping Overview Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Ekspedisi Pengiriman
                    </span>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{displayOrder.courierName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({displayOrder.courierService})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Nomor Resi
                    </span>
                    <div className="text-sm font-bold font-mono text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {displayOrder.trackingNumber || 'Sedang Digenerate'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Penerima:</span>
                    <p className="font-semibold text-slate-800">{displayOrder.customerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {displayOrder.shippingAddress}, {displayOrder.destinationCity}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Status Terakhir:</span>
                    <p className="font-bold text-emerald-700 uppercase">
                      {displayOrder.orderStatus === 'delivered'
                        ? 'Paket Diterima'
                        : displayOrder.orderStatus === 'shipped'
                        ? 'Dalam Pengiriman'
                        : displayOrder.orderStatus === 'processing'
                        ? 'Diproses di Gudang'
                        : 'Menunggu Pengiriman'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Total {displayOrder.items.length} Barang · {displayOrder.totalWeight}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Live Tracking Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Riwayat Perjalanan Paket (Tracking Milestones)</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                  {displayOrder.trackingTimeline.map((item, index) => {
                    const isLatest = index === displayOrder.trackingTimeline.length - 1;
                    return (
                      <div key={index} className="relative group">
                        {/* Timeline Milestone Dot */}
                        <div
                          className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                            isLatest
                              ? 'bg-emerald-600 border-white text-white shadow-sm ring-2 ring-emerald-300'
                              : 'bg-emerald-100 border-emerald-500 text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span
                              className={`text-xs font-bold ${
                                isLatest ? 'text-emerald-700 font-extrabold' : 'text-slate-900'
                              }`}
                            >
                              {item.status}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.location}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items summary */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 mb-1.5 block">Isi Paket:</span>
                <div className="space-y-1">
                  {displayOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>
                        {i.quantity}x {i.productName}
                      </span>
                      <span className="font-mono">{formatRupiah(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada pesanan yang dipilih untuk dilacak.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {displayOrder && (
            <button
              onClick={() => openThermalReceipt(displayOrder)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Resi Thermal</span>
            </button>
          )}

          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
