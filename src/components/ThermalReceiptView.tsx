import React from 'react';
import { Order, StoreSettings } from '../types';
import { generateBarcodeSvg } from '../utils/barcode';
import { formatRupiah, formatShortDate } from '../utils/formatters';

interface ThermalReceiptViewProps {
  order: Order;
  settings: StoreSettings;
}

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({ order, settings }) => {
  const trackingNo = order.trackingNumber || `SVX${order.invoiceNumber.replace(/\D/g, '')}ID`;
  const barcodeSvg = generateBarcodeSvg(trackingNo, 48);

  const isCod = order.paymentMethod === 'cod';

  return (
    <div
      className="thermal-receipt-print-wrapper bg-white text-black font-sans select-none border border-dashed border-slate-300 print:border-none mx-auto mb-6 print:mb-0"
      style={{
        width: '100mm',
        minHeight: '165mm',
        maxHeight: '165mm',
        padding: '3.5mm',
        boxSizing: 'border-box',
        fontSize: '9pt',
        lineHeight: 1.25,
      }}
    >
      {/* 1. Header: Ekspedisi & Badge */}
      <div className="border-b-2 border-black pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-black text-white font-black text-sm flex items-center justify-center rounded">
            SV
          </div>
          <div>
            <div className="font-extrabold text-xs uppercase tracking-tight">
              {order.courierName}
            </div>
            <div className="text-[7pt] text-slate-700 font-bold uppercase">
              {order.courierService}
            </div>
          </div>
        </div>

        {/* COD or NON-COD Badge */}
        <div className="text-right">
          {isCod ? (
            <div className="border-2 border-black px-2 py-0.5 font-black text-xs uppercase bg-black text-white">
              COD: {formatRupiah(order.totalAmount)}
            </div>
          ) : (
            <div className="border border-black px-1.5 py-0.5 font-bold text-[8pt] uppercase">
              NON-COD (LUNAS)
            </div>
          )}
        </div>
      </div>

      {/* 2. Barcode Code-128 Area */}
      <div className="py-2 text-center border-b border-black">
        <div
          className="w-full flex justify-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: barcodeSvg }}
        />
        <div className="font-mono font-bold text-[10pt] tracking-widest mt-0.5">
          {trackingNo}
        </div>
        <div className="text-[7pt] text-slate-600 font-mono">
          No. Invoice: {order.invoiceNumber} · Tgl: {formatShortDate(order.createdAt)}
        </div>
      </div>

      {/* 3. Penerima & Pengirim (2-Row Table) */}
      <div className="border-b border-black text-[8pt]">
        {/* Penerima */}
        <div className="py-1.5 border-b border-dashed border-black/50">
          <div className="text-[7pt] font-bold uppercase text-slate-500">PENERIMA:</div>
          <div className="font-bold text-[9pt] leading-tight">{order.customerName}</div>
          <div className="font-mono text-[8pt] font-semibold">{order.customerPhone}</div>
          <div className="text-[8pt] leading-snug mt-0.5">
            {order.shippingAddress}, {order.destinationCity} {order.postalCode}
          </div>
          {order.customerNotes && (
            <div className="text-[7pt] italic mt-0.5 text-slate-700 bg-slate-100 p-0.5">
              Catatan: {order.customerNotes}
            </div>
          )}
        </div>

        {/* Pengirim */}
        <div className="py-1.5 flex justify-between">
          <div>
            <div className="text-[7pt] font-bold uppercase text-slate-500">PENGIRIM:</div>
            <div className="font-bold leading-tight">{settings.storeName}</div>
            <div className="font-mono text-[7pt]">{settings.phoneNumber}</div>
            <div className="text-[7pt] leading-tight text-slate-700 truncate max-w-[55mm]">
              {settings.address}, {settings.city}
            </div>
          </div>
          <div className="text-right text-[7pt]">
            <div className="font-bold uppercase text-slate-500">BERAT PAKET:</div>
            <div className="font-bold font-mono text-[9pt]">{order.totalWeight} gr</div>
            <div className="text-[7pt] text-slate-600">Kota Asal: {settings.city}</div>
          </div>
        </div>
      </div>

      {/* 4. Daftar Barang (Itemized list) */}
      <div className="py-1.5 border-b border-black text-[7.5pt]">
        <div className="font-bold uppercase text-[7pt] text-slate-500 mb-0.5">
          RINCIAN PRODUK ({order.items.reduce((s, i) => s + i.quantity, 0)} pcs):
        </div>
        <div className="space-y-0.5 max-h-24 overflow-hidden">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-baseline leading-tight">
              <span className="truncate pr-1">
                {idx + 1}. {item.productName} (x{item.quantity})
              </span>
              <span className="font-mono font-semibold shrink-0">
                {formatRupiah(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer: QR & Tanda Tangan */}
      <div className="pt-2 flex items-center justify-between text-[7pt]">
        <div className="flex items-center gap-2">
          {/* Simulated QR Pattern */}
          <div className="w-12 h-12 border border-black p-0.5 bg-white flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-3 h-3 bg-black" />
              <div className="w-3 h-3 bg-black" />
            </div>
            <div className="text-[5pt] font-mono text-center leading-none">VERIFIED</div>
            <div className="flex justify-between">
              <div className="w-3 h-3 bg-black" />
              <div className="w-1.5 h-1.5 bg-black" />
            </div>
          </div>

          <div>
            <div className="font-bold text-[7.5pt] uppercase">Standard Resi Thermal</div>
            <div className="text-[6.5pt] text-slate-600">Ukuran Kertas: 100mm × 165mm</div>
            <div className="text-[6.5pt] text-slate-600">ShopVista Official Logistics</div>
          </div>
        </div>

        <div className="border border-dashed border-black w-24 h-12 p-1 text-center flex flex-col justify-between">
          <span className="text-[6pt] text-slate-500">Tanda Tangan Penerima</span>
          <div className="border-t border-black/40 text-[5.5pt] text-slate-400">
            Nama Jelas
          </div>
        </div>
      </div>
    </div>
  );
};
