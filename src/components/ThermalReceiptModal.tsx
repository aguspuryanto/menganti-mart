import React, { useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useStore } from '../context/StoreContext';
import { ThermalReceiptView } from './ThermalReceiptView';
import { formatRupiah, formatShortDate } from '../utils/formatters';

export const ThermalReceiptModal: React.FC = () => {
  const { isThermalModalOpen, setIsThermalModalOpen, thermalOrders, settings } = useStore();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isThermalModalOpen || thermalOrders.length === 0) return null;

  // Print using standard browser print dialog tailored to 100mm x 165mm
  const handlePrint = () => {
    window.print();
  };

  // Generate and download a real PDF via jsPDF with 100mm x 165mm page format
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    try {
      // Create jsPDF instance with dimensions 100mm x 165mm (portrait)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 165],
      });

      thermalOrders.forEach((order, index) => {
        if (index > 0) {
          doc.addPage([100, 165], 'portrait');
        }

        const trackingNo = order.trackingNumber || `SVX${order.invoiceNumber.replace(/\D/g, '')}ID`;

        // Outer border
        doc.setLineWidth(0.3);
        doc.rect(4, 4, 92, 157);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(order.courierName.toUpperCase(), 8, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(order.courierService, 8, 16);

        // COD Stamp
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        if (order.paymentMethod === 'cod') {
          doc.rect(55, 7, 38, 9);
          doc.text(`COD: ${formatRupiah(order.totalAmount)}`, 57, 13);
        } else {
          doc.rect(60, 7, 33, 8);
          doc.text('NON-COD / LUNAS', 62, 12.5);
        }

        // Horizontal line
        doc.line(4, 20, 96, 20);

        // Barcode Text & Tracking
        doc.setFont('courier', 'bold');
        doc.setFontSize(14);
        doc.text(trackingNo, 50, 30, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Invoice: ${order.invoiceNumber} | Tgl: ${formatShortDate(order.createdAt)}`, 50, 35, {
          align: 'center',
        });

        // Horizontal line
        doc.line(4, 38, 96, 38);

        // Receiver Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('PENERIMA:', 8, 43);
        doc.setFontSize(10);
        doc.text(order.customerName, 8, 48);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`Telp: ${order.customerPhone}`, 8, 53);

        // Multiline address
        const splitAddress = doc.splitTextToSize(
          `${order.shippingAddress}, ${order.destinationCity} ${order.postalCode}`,
          84
        );
        doc.text(splitAddress, 8, 58);

        // Line
        doc.line(4, 72, 96, 72);

        // Sender Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('PENGIRIM:', 8, 77);
        doc.setFontSize(9);
        doc.text(settings.storeName, 8, 81);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Telp: ${settings.phoneNumber}`, 8, 85);
        doc.text(`Kota Asal: ${settings.city}`, 8, 89);

        doc.setFont('helvetica', 'bold');
        doc.text(`BERAT: ${order.totalWeight} gr`, 65, 81);

        // Line
        doc.line(4, 93, 96, 93);

        // Items Breakdown
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('RINCIAN PRODUK:', 8, 98);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        let yPos = 103;
        order.items.slice(0, 5).forEach((item, itemIdx) => {
          doc.text(`${itemIdx + 1}. ${item.productName.substring(0, 32)} (x${item.quantity})`, 8, yPos);
          doc.text(formatRupiah(item.price * item.quantity), 92, yPos, { align: 'right' });
          yPos += 5;
        });

        // Notes if any
        if (order.customerNotes) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7);
          doc.text(`Catatan: ${order.customerNotes.substring(0, 50)}`, 8, yPos + 2);
        }

        // Line
        doc.line(4, 136, 96, 136);

        // Footer & Signature
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('ShopVista Logistics Standard Thermal', 8, 142);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Ukuran Kertas: 100mm x 165mm', 8, 146);
        doc.text('Terima kasih telah berbelanja di ShopVista!', 8, 150);

        // Signature box
        doc.rect(65, 139, 27, 18);
        doc.setFontSize(6.5);
        doc.text('Tanda Tangan Penerima', 78.5, 143, { align: 'center' });
      });

      // Download PDF
      const filename =
        thermalOrders.length === 1
          ? `Resi-Thermal-${thermalOrders[0].trackingNumber || 'ShopVista'}.pdf`
          : `Resi-Massal-${thermalOrders.length}-Pesanan.pdf`;

      doc.save(filename);
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal membuat PDF. Silakan gunakan tombol Cetak Layar Browser.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col border border-slate-200 overflow-hidden text-left">
        {/* Header (Hidden during browser print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pratinjau Resi Pengiriman Thermal (100mm × 165mm)
              </h3>
              <p className="text-[11px] text-slate-400">
                {thermalOrders.length > 1
                  ? `Mode Cetak Massal: ${thermalOrders.length} Resi Pesanan`
                  : `1 Pesanan: ${thermalOrders[0].invoiceNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsThermalModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar (no-print) */}
        <div className="no-print bg-slate-50 p-3 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            Format kertas standar thermal printer (<strong>100mm × 165mm</strong>) dengan Barcode Code-128 presisi.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Terunduh</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh File PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Thermal</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 flex flex-col items-center">
          {thermalOrders.map(order => (
            <ThermalReceiptView key={order.id} order={order} settings={settings} />
          ))}
        </div>

        {/* Footer info (no-print) */}
        <div className="no-print p-3 sm:px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>
            * Kompatibel dengan semua printer thermal USB / Bluetooth (Zebra, Xprinter, Honeywell, dll).
          </span>
          <button
            onClick={() => setIsThermalModalOpen(false)}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
