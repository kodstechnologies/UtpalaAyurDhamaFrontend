import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import { getFooter } from "../../../../components/pdf/pdfFooter";
import { pdfPrHeader } from "../../../../components/pdf/pdfPrHeader";
// Simple Indian rupees number to words (basic – extend for production)
const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const hundreds = ["", "One Hundred", "Two Hundred", "Three Hundred", "Four Hundred", "Five Hundred",
    "Six Hundred", "Seven Hundred", "Eight Hundred", "Nine Hundred"];

  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 ? " " + numberToWords(num % 100) : "");
  // For simplicity – add thousand/lakh logic if needed
  return num.toString();
};

export const handlePrint = async (id) => {
  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

  try {
    const response = await axios.get(
      getApiUrl(`examinations/user-last-prescription/${id}`),
      { headers: getAuthHeaders() }
    );

    const data = response.data?.data;

    if (!data) {
      alert("No prescription data found");
      return;
    }

    // Escape HTML function for safety
    const escapeHtml = (text) => {
      if (!text) return "";
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Map your API data fields
    const patient = {
      name: data.patientName || "N/A",
      gender: data.gender || "N/A",
      age: data.age || "",
      mobile: data.mobile || "",
    };

    const invoice = {
      no: data.invoiceNo || "N/A",
      date: data.date || new Date().toLocaleDateString("en-IN"),
      doctor: data.doctorName || "Dr. Nagaraj",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    const diagnosis = (data.diagnosis || "").trim();

    // Financials
    const subtotalNum = Number(data.subtotal || 0);
    const gstRateNum = Number(data.gst || 0);
    const subtotal = subtotalNum.toFixed(2);
    const gstAmount = Number(data.gstAmount || 0).toFixed(2);
    const totalWithGstNum = Number(data.totalWithGst || 0);
    const totalWithGst = totalWithGstNum.toFixed(2);

    let gstRateText = "";
    if (gstRateNum > 0) {
      gstRateText = `${gstRateNum}%`;
    } else if (Number(gstAmount) > 0 && subtotalNum > 0) {
      gstRateText = `${Math.round((Number(gstAmount) / subtotalNum) * 100)}%`;
    }

    const amountInWords = `Rupees ${numberToWords(Math.round(totalWithGstNum))} Only`;

    const paidNum = Number(data.padeamount || 0);
    const balanceDueNum =
      data.balanceDue != null && data.balanceDue !== ""
        ? Number(data.balanceDue)
        : Math.max(0, Math.round((totalWithGstNum - paidNum) * 100) / 100);

    let paymentStatusLabel = data.paymentStatus || "Unpaid";
    if (totalWithGstNum > 0 && balanceDueNum > 0 && paidNum > 0) paymentStatusLabel = "Partially Paid";
    else if (totalWithGstNum > 0 && balanceDueNum <= 0) paymentStatusLabel = "Paid";
    else if (paidNum <= 0) paymentStatusLabel = "Unpaid";

    const statusBadgeBg =
      paymentStatusLabel === "Paid"
        ? "#2e7d32"
        : paymentStatusLabel === "Partially Paid"
          ? "#0277bd"
          : "#ed6c02";
    const statusBadgeHtml = `<span class="pay-status-badge" style="background:${statusBadgeBg}">${escapeHtml(paymentStatusLabel)}</span>`;

    const payments = Array.isArray(data.payments) ? data.payments : [];
    const paymentHistoryRows =
      payments.length > 0
        ? payments
            .map(
              (p, i) => `
        <tr>
          <td class="ph-cell ph-srl">${i + 1}</td>
          <td class="ph-cell ph-amt">₹${Number(p.amount || 0).toFixed(2)}</td>
          <td class="ph-cell">${escapeHtml(String(p.method || "—"))}</td>
          <td class="ph-cell ph-muted">${escapeHtml(String(p.paidAt || "—"))}</td>
          <td class="ph-cell ph-muted ph-ref">${escapeHtml(String(p.reference || "—"))}</td>
        </tr>`
            )
            .join("")
        : `<tr><td colspan="5" class="ph-empty">No payment entries recorded</td></tr>`;

    // Medicines – adapt your API structure
    const items = data.medicines || [];
    const medicinesRows = items.map((m, i) => {
      const qty = Number(m.quantity || 1);
      const rate = Number(m.price || m.rate || 0);
      const total = qty * rate;

      return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:5px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:5px;">${escapeHtml(m.medicineName || m.itemName || "")}</td>
          <td style="text-align:center; border:1px solid #000; padding:5px;">${qty}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px;">${rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px;">${total.toFixed(2)}</td>
         </tr>
      `;
    }).join("");

    const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || 1), 0);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prescription - Utpala Ayurdhama</title>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          margin: 0 auto;
          padding: 0;
          color: #000;
          max-width: 50rem;
          width: 100%;
        }
        .report-container { width: 100%; border-collapse: collapse; }
        .report-header { display: table-header-group; }
        .report-footer { position: fixed; bottom: 0; left: 0; right: 0; max-width: 50rem; width: 100%; margin: 0 auto; background: white; z-index: 10; }
        .footer-spacer { height: 180px; }
        .main-content { padding: 15px; width: 100%; }
        .info-container {
          display: flex;
          border: 1px solid #000;
          margin: 10px 0;
        }
        .patient-box {
          width: 65%;
          background: #fafafa;
          padding: 12px;
          border-right: 1px solid #000;
        }
        .receipt-box {
          width: 35%;
          background: #fafafa;
        }
        .receipt-title {
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          border-bottom: 1px solid #000;
          padding: 8px;
          background: #f5f0eb;
        }
        .info-table {
          width: 100%;
          font-size: 12px;
        }
        .info-table td {
          padding: 5px 8px;
        }
        .info-table .label {
          font-weight: bold;
          width: 100px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 11px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 6px;
        }
        .items-table th {
          background: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }
        .total-row {
          font-weight: bold;
          background: #f9f9f9;
        }
        .final-total {
          background: #e8f5e9;
        }
        .diagnosis-strip {
          margin: 8px 0 0;
          padding: 8px 12px;
          background: #fff8e1;
          border: 1px solid #e0c080;
          border-radius: 4px;
          font-size: 11px;
          line-height: 1.4;
        }
        .diagnosis-strip strong { color: #5d4037; }
        .amount-words {
          margin: 10px 0 4px;
          padding: 8px 10px;
          background: #fafafa;
          border: 1px dashed #bbb;
          font-size: 11px;
          font-style: italic;
          color: #333;
        }
        .billing-ledger {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 16px;
          align-items: start;
        }
        @media (max-width: 520px) {
          .billing-ledger { grid-template-columns: 1fr; }
        }
        .ledger-panel {
          border: 1px solid #1a237e;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }
        .ledger-panel-h {
          background: linear-gradient(90deg, #283593 0%, #3949ab 100%);
          color: #fff;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 8px 10px;
        }
        .ledger-panel-h.history { background: linear-gradient(90deg, #00695c 0%, #00897b 100%); }
        .ledger-panel-body { padding: 10px; }
        .pay-status-badge {
          display: inline-block;
          color: #fff;
          font-weight: 700;
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 0.03em;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
          font-size: 11px;
        }
        .summary-row:last-of-type { border-bottom: none; }
        .summary-row .lbl { color: #555; text-align: left; }
        .summary-row .val { font-weight: 600; text-align: right; white-space: nowrap; }
        .summary-row.total { font-size: 12px; padding-top: 8px; margin-top: 4px; border-top: 2px solid #283593; border-bottom: none; }
        .summary-row.total .val { color: #1565c0; font-size: 13px; }
        .summary-row.paid .val { color: #2e7d32; }
        .summary-row.due .val { color: #c62828; }
        .ph-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 6px; }
        .ph-table th {
          background: #e0f2f1;
          border: 1px solid #00897b;
          padding: 5px 4px;
          font-weight: 700;
          text-align: center;
          color: #004d40;
        }
        .ph-cell {
          border: 1px solid #b2dfdb;
          padding: 6px 5px;
          vertical-align: top;
        }
        .ph-srl { text-align: center; width: 8%; }
        .ph-amt { text-align: right; font-weight: 600; width: 18%; }
        .ph-muted { color: #555; font-size: 9px; }
        .ph-ref { word-break: break-all; max-width: 120px; }
        .ph-empty { text-align: center; padding: 12px; color: #777; border: 1px dashed #b2dfdb; }
        @media print {
          body { border: none; margin: 0; width: 100%; max-width: none; }
          .report-header { display: table-header-group; }
          .report-footer { position: fixed; bottom: 0; left: 0; right: 0; max-width: 100%; width: 100%; margin: 0 auto; }
          .billing-ledger { page-break-inside: avoid; }
          .ledger-panel { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <table class="report-container">
        <thead>
          <tr>
            <td class="report-header">
              ${pdfPrHeader()}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="main-content">
                <!-- Patient + Prescription Info -->
                <div class="info-container">
                  <div class="patient-box">
                    <table class="info-table">
                      <tr><td class="label">Patient Name</td><td>:</td><td>${escapeHtml(patient.name)}</td></tr>
                      <tr><td class="label">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
                      <tr><td class="label">Mobile No</td><td>:</td><td>${escapeHtml(patient.mobile)}</td></tr>
                      <tr><td class="label">Generated By</td><td>:</td><td>${escapeHtml(receptionistName || "")}</td></tr>
                    </table>
                    ${diagnosis ? `<div class="diagnosis-strip"><strong>Notes / diagnosis</strong><br/>${escapeHtml(diagnosis)}</div>` : ""}
                  </div>
                  <div class="receipt-box">
                    <div class="receipt-title">PRESCRIPTION</div>
                    <table class="info-table" style="margin-top:8px;">
                      <tr><td class="label">Invoice No.</td><td>:</td><td>${escapeHtml(String(invoice.no))}</td></tr>
                      <tr><td class="label">Date:</td><td>${invoice.date}</td></tr>
                      <tr><td class="label">Time:</td><td>${invoice.time}</td></tr>
                      <tr><td class="label">Doctor:</td><td>${escapeHtml(invoice.doctor)}</td></tr>
                    </table>
                  </div>
                </div>

                <!-- Items Table -->
                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 8%">Srl</th>
                      <th style="width: 52%">Medicine Name</th>
                      <th style="width: 10%">Qty</th>
                      <th style="width: 15%">Rate (₹)</th>
                      <th style="width: 15%">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${medicinesRows}
                    
                    <!-- Subtotal -->
                    <tr class="total-row">
                      <td colspan="3" style="text-align:right; font-weight:bold;">Sub Total</td>
                      <td style="text-align:center;">${totalQty}</td>
                      <td style="text-align:right; font-weight:bold;">₹${subtotal}</td>
                    </tr>
                    
                    <!-- GST Row -->
                    ${Number(gstAmount) > 0 ? `
                      <tr class="total-row">
                        <td colspan="4" style="text-align:right; font-weight:bold;">GST (${gstRateText || "—"})</td>
                        <td style="text-align:right; font-weight:bold;">₹${gstAmount}</td>
                      </tr>
                    ` : ""}
                    
                    <!-- Grand Total -->
                    <tr class="final-total">
                      <td colspan="4" style="text-align:right; font-weight:bold; font-size:13px;">Total (with GST)</td>
                      <td style="text-align:right; font-weight:bold; font-size:13px; color:#8B4513;">₹${totalWithGst}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="amount-words"><strong>Amount in words:</strong> ${escapeHtml(amountInWords)}</div>

                <div class="billing-ledger">
                  <div class="ledger-panel">
                    <div class="ledger-panel-h history">Payment history</div>
                    <div class="ledger-panel-body">
                      <table class="ph-table">
                        <thead>
                          <tr>
                            <th>Srl</th>
                            <th>Amount (₹)</th>
                            <th>Method</th>
                            <th>Date / time</th>
                            <th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>${paymentHistoryRows}</tbody>
                      </table>
                    </div>
                  </div>
                  <div class="ledger-panel">
                    <div class="ledger-panel-h">Billing summary</div>
                    <div class="ledger-panel-body">
                      <div style="text-align:right;margin-bottom:10px;">${statusBadgeHtml}</div>
                      <div class="summary-row"><span class="lbl">Cost (without GST)</span><span class="val">₹${subtotal}</span></div>
                      <div class="summary-row"><span class="lbl">GST (${gstRateText || "—"})</span><span class="val">₹${gstAmount}</span></div>
                      <div class="summary-row total"><span class="lbl">Total (with GST)</span><span class="val">₹${totalWithGst}</span></div>
                      <div class="summary-row paid"><span class="lbl">Total paid</span><span class="val">₹${paidNum.toFixed(2)}</span></div>
                      <div class="summary-row due"><span class="lbl">Balance due</span><span class="val">₹${balanceDueNum.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div class="footer-spacer"></div>
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="report-footer">
        ${getFooter()}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
          window.onafterprint = function() {
            setTimeout(function() {
              if (window.opener && !window.opener.closed) {
                window.close();
              }
            }, 1000);
          };
        };
      </script>
    </body>
    </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank", "width=1000,height=800,scrollbars=yes,resizable=yes");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      // Focus the print window
      printWindow.focus();
    } else {
      alert("Popup blocked! Please allow popups to print the prescription.");
    }

  } catch (error) {
    console.error("Error fetching prescription:", error);
    alert("Error fetching prescription. Please try again.");
  }
};