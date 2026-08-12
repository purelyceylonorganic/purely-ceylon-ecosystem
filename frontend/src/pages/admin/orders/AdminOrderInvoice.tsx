import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { invoiceService } from "../../../services/invoice.service";
import Logo from "../../../assets/logo.png";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function AdminOrderInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const loadInvoice = async () => {
    try {
      const data = await invoiceService.getInvoice(id!);
      setInvoice(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (!invoice) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading Invoice...
      </div>
    );
  }

  const invoiceNumber = `INV-${new Date(invoice.createdAt).getFullYear()}-${invoice.id
    .replace(/-/g, "")
    .substring(0, 8)
    .toUpperCase()}`;

  const paymentStatus = invoice.paymentStatus || "UNPAID";
  const stampColor =
    paymentStatus === "PAID"
      ? "text-green-600 border-green-600"
      : paymentStatus === "PARTIAL"
      ? "text-yellow-500 border-yellow-500"
      : "text-red-600 border-red-600";

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <style>{`
        @media print {
          .thermal {
            width: 80mm;
            margin: auto;
            font-size: 12px;
          }
          body {
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* ================= A4 INVOICE VIEW ================= */}
      <div
        ref={invoiceRef}
        className="max-w-5xl mx-auto bg-white shadow rounded-lg p-10 invoice relative overflow-hidden"
      >
        {/* Paid / Status Stamp */}
        <div
          className={`absolute top-10 right-10 text-4xl font-bold uppercase rotate-12 opacity-30 border-4 px-4 py-2 rounded-xl pointer-events-none ${stampColor}`}
        >
          {paymentStatus}
        </div>

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center border-b pb-6">
          <div className="flex items-center gap-4">
            <img
              src={Logo}
              alt="Purely Ceylon"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Purely Ceylon Organic
              </h1>
              <p className="text-gray-600 mt-1">
                Premium Organic Products
              </p>
              <p className="text-sm text-gray-500">Sri Lanka</p>
              <p className="text-sm text-gray-500">info@purelyceylon.com</p>
              <p className="text-sm text-gray-500">+94 77 123 4567</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-4xl font-bold">INVOICE</h2>
            <p className="mt-4">
              <strong>Invoice No :</strong> {invoiceNumber}
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Status :</strong>{" "}
              <span
                className={`font-bold ${
                  paymentStatus === "PAID"
                    ? "text-green-600"
                    : paymentStatus === "PARTIAL"
                    ? "text-yellow-500"
                    : "text-red-600"
                }`}
              >
                {paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* ================= CUSTOMER ================= */}
        <div className="grid grid-cols-2 gap-10 mt-10">
          <div>
            <h3 className="font-bold text-lg mb-3">Bill To</h3>
            <p>{invoice.user?.fullName}</p>
            <p>{invoice.user?.email}</p>
            <p>{invoice.user?.phone}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Shipping Address</h3>
            <p>{invoice.address?.fullName}</p>
            <p>{invoice.address?.street}</p>
            <p>
              {invoice.address?.city} {invoice.address?.postalCode}
            </p>
            <p>{invoice.address?.country}</p>
          </div>
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">Order Items</h3>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-3 text-left">Product</th>
                <th className="border px-4 py-3 text-center">SKU</th>
                <th className="border px-4 py-3 text-center">Weight</th>
                <th className="border px-4 py-3 text-center">Qty</th>
                <th className="border px-4 py-3 text-right">Unit Price</th>
                <th className="border px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="border px-4 py-3">
                    {item.productVariant?.product?.name || "Product"}
                  </td>
                  <td className="border px-4 py-3 text-center">
                    {item.productVariant?.sku || "-"}
                  </td>
                  <td className="border px-4 py-3 text-center">
                    {item.productVariant?.weight || "-"}
                  </td>
                  <td className="border px-4 py-3 text-center">
                    {item.quantity}
                  </td>
                  <td className="border px-4 py-3 text-right">
                    {invoice.currency || "LKR"}{" "}
                    {item.price.toFixed(2)}
                  </td>
                  <td className="border px-4 py-3 text-right font-semibold">
                    {invoice.currency || "LKR"}{" "}
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= ORDER SUMMARY ================= */}
        <div className="flex justify-end mt-10">
          <div className="w-96 border rounded-lg p-5">
            <div className="flex justify-between py-2">
              <span>Subtotal</span>
              <span>
                {invoice.currency || "LKR"} {invoice.totalFinal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping</span>
              <span>
                {invoice.currency || "LKR"}{" "}
                {(invoice.shippingCost || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Tax</span>
              <span>
                {invoice.currency || "LKR"}{" "}
                {(invoice.taxAmount || 0).toFixed(2)}
              </span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-xl font-bold">
              <span>Grand Total</span>
              <span>
                {invoice.currency || "LKR"}{" "}
                {(
                  invoice.totalFinal +
                  (invoice.shippingCost || 0) +
                  (invoice.taxAmount || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= PAYMENT SUMMARY ================= */}
        <div className="mt-10 border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-5">Payment Summary</h3>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="mb-2">
                <strong>Payment Status :</strong>
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                  paymentStatus === "PAID"
                    ? "bg-green-600"
                    : paymentStatus === "PARTIAL"
                    ? "bg-yellow-500"
                    : "bg-red-600"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
            <div>
              <p className="mb-2">
                <strong>Payment Method :</strong>
              </p>
              <p>{invoice.paymentMethod || "Not Available"}</p>
            </div>
          </div>
        </div>

        {/* ================= QR & BARCODE FOOTER ELEMENTS ================= */}
        <div className="mt-10 flex justify-between items-center border-t pt-6">
          <div>
            <Barcode value={invoice.id} height={40} fontSize={14} />
          </div>
          <div>
            <QRCode
              value={`https://purelyceylon.com/orders/${invoice.id}`}
              size={90}
            />
          </div>
        </div>

        {/* ================= PRINT & DOWNLOAD BUTTONS ================= */}
        <div className="mt-10 flex justify-end gap-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Print Thermal
          </button>
          <button
            onClick={() => window.print()}
            className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800"
          >
            Print Invoice
          </button>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>

        {/* ================= ENTERPRISE FOOTER ================= */}
        <div className="mt-16 border-t pt-6 text-center text-sm text-gray-600">
          <p className="font-semibold text-base">Thank You</p>
          <p className="font-bold text-green-700 mt-1">Purely Ceylon Organic</p>
          <p className="text-xs text-gray-500 mt-1">Organic • Authentic • Premium</p>
          <p className="mt-2">www.purelyceylon.com</p>
          <p>Email: info@purelyceylon.com</p>
          <p>Phone: +94 77 123 4567</p>
          <p className="mt-4 text-xs text-gray-400">
            ---------------------------------------------------
          </p>
        </div>
      </div>
    </div>
  );
}