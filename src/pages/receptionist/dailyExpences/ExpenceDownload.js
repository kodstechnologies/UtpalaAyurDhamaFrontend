import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import logo from "../../../assets/logo/logo2.png";

// Number to words (Indian style)
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertToWords = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertToWords(n % 100) : "");
    if (n < 100000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      return convertToWords(thousands) + " Thousand" + (remainder ? " " + convertToWords(remainder) : "");
    }
    if (n < 10000000) {
      const lakhs = Math.floor(n / 100000);
      const remainder = n % 100000;
      return convertToWords(lakhs) + " Lakh" + (remainder ? " " + convertToWords(remainder) : "");
    }
    if (n < 1000000000) {
      const crores = Math.floor(n / 10000000);
      const remainder = n % 10000000;
      return convertToWords(crores) + " Crore" + (remainder ? " " + convertToWords(remainder) : "");
    }
    return n.toString();
  };

  return convertToWords(num);
};

export const handleDownload = async (dateStr) => {
  try {
    // Validate date
    if (!dateStr) {
      toast.error("Please select a date");
      return;
    }

    const [year, month, day] = dateStr.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    // Show loading toast
    toast.loading("Generating expense report...", { toastId: "expense-loading" });

    const response = await axios.get(
      getApiUrl("expense/expenseItem"),
      {
        headers: getAuthHeaders(),
        params: { date: formattedDate },
      }
    );

    // Access expenses from the correct path
    const expenses = response.data?.data?.expenses || [];
    const totalAmount = response.data?.data?.total || 0;

    if (!expenses || expenses.length === 0) {
      toast.dismiss("expense-loading");
      toast.error(`No expenses found for date: ${formattedDate}`);
      return;
    }

    // Calculate total if not provided
    const calculatedTotal = expenses.reduce((sum, item) => sum + (item.cost || 0), 0);
    const finalTotal = totalAmount || calculatedTotal;

    const invoice = {
      no: "EXP-" + formattedDate.replace(/-/g, "") + "-" + new Date().getTime(),
      date: formattedDate,
      generatedAt: new Date().toLocaleString(),
    };

    // Escape HTML function
    const escapeHtml = (text) => {
      if (!text) return "";
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Convert logo to base64 to ensure it displays in PDF
    const getLogoBase64 = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          // Fallback - create a text-based logo
          resolve(null);
        };
        img.src = logo;
      });
    };

    const logoBase64 = await getLogoBase64();

    // Map expenses to table rows
    const expensesRows = expenses.map((item, i) => {
      const qty = Number(item.count || 1);
      const total = Number(item.cost || 0);
      const rate = qty > 0 ? total / qty : 0;
      const paymentMethod = item.method || item.paymentMethod || "Cash";
      const expenseName = item.name || item.type || "Unknown Item";

      return `
        <tr>
          <td style="text-align:center; border:1px solid #ddd; padding:10px 8px;">${i + 1}</td>
          <td style="border:1px solid #ddd; padding:10px 8px;">${escapeHtml(expenseName)}</td>
          <td style="text-align:center; border:1px solid #ddd; padding:10px 8px;">${qty}</td>
          <td style="text-align:center; border:1px solid #ddd; padding:10px 8px;">${escapeHtml(paymentMethod)}</td>
          <td style="text-align:right; border:1px solid #ddd; padding:10px 8px;">₹${rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #ddd; padding:10px 8px;">₹${total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const subtotal = finalTotal.toFixed(2);
    const totalWithGst = finalTotal.toFixed(2);
    const amountInWords = `Rupees ${numberToWords(Math.round(finalTotal))} Only`;

    // Create container for PDF
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.padding = "20px";
    container.style.margin = "0";
    container.style.boxSizing = "border-box";
    container.style.background = "#fff";
    container.style.fontFamily = "'Segoe UI', Arial, sans-serif";

    // Logo HTML (either image or text fallback)
    const logoHtml = logoBase64
      ? `<img src="${logoBase64}" alt="Utpala Ayurdhama Logo" style="height: 80px; width: auto; object-fit: contain;" />`
      : `<div style="font-size: 48px; font-weight: bold; color: #8B4513;">🏥 UTPL</div>`;

    // Set the HTML content
    container.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report - Utpala Ayurdhama</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #000;
            background: white;
            line-height: 1.4;
          }
          .print-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
          }
          .header {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe4cc 100%);
            padding: 25px 20px;
            text-align: center;
            border-bottom: 3px solid #8B4513;
            margin-bottom: 10px;
          }
          .logo {
            margin-bottom: 15px;
          }
          .logo img {
            max-height: 80px;
            width: auto;
          }
          .clinic-name {
            font-size: 28px;
            font-weight: bold;
            color: #8B4513;
            margin: 8px 0;
            letter-spacing: 1px;
          }
          .clinic-info {
            font-size: 11px;
            margin: 8px 0;
            color: #666;
            line-height: 1.5;
          }
          .gst-info {
            font-size: 10px;
            color: #888;
            margin-top: 5px;
          }
          .title {
            font-size: 22px;
            font-weight: bold;
            margin: 25px 0 20px;
            text-align: center;
            color: #8B4513;
            text-transform: uppercase;
            letter-spacing: 2px;
            background: #f9f5f0;
            padding: 12px;
            border-radius: 8px;
          }
          .receipt-container {
            display: flex;
            border: 1px solid #ddd;
            margin: 20px 0;
            background: #fafafa;
            border-radius: 8px;
            overflow: hidden;
          }
          .info-box {
            flex: 1;
            padding: 15px;
          }
          .info-box:first-child {
            border-right: 1px solid #ddd;
          }
          .info-box table {
            width: 100%;
            font-size: 13px;
          }
          .info-box td {
            padding: 6px;
          }
          .label {
            font-weight: bold;
            width: 110px;
            color: #555;
          }
          .colon {
            width: 15px;
            text-align: center;
          }
          .value {
            color: #333;
          }
          .items-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
            font-size: 12px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #ddd;
            padding: 10px 8px;
          }
          .items-table th {
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            font-weight: bold;
            text-align: center;
            color: #555;
          }
          .total-row {
            background: #f9f9f9;
          }
          .total-row td {
            font-weight: bold;
          }
          .final-total {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          }
          .final-total td {
            font-weight: bold;
            font-size: 14px;
          }
          .amount-words {
            margin: 20px 0;
            padding: 12px;
            background: #fff3e0;
            border-left: 4px solid #8B4513;
            font-style: italic;
            font-size: 13px;
            color: #555;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            background: #6b3f36;
            color: #fff;
            display: flex;
            justify-content: space-between;
            padding: 20px;
            font-size: 11px;
            border-radius: 8px;
          }
          .footer-left,
          .footer-right {
            flex: 1;
          }
          .footer-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 13px;
            color: #ffd966;
          }
          .footer i {
            margin-right: 8px;
            width: 20px;
            display: inline-block;
          }
          .footer div {
            margin-bottom: 6px;
            line-height: 1.4;
          }
          .signature {
            margin: 30px 0 20px;
            text-align: right;
            border-top: 1px dashed #ccc;
            padding-top: 20px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header Section -->
          <div class="header">
            <div class="logo">
              ${logoHtml}
            </div>
            <div class="clinic-name">Utpala Ayurdhama</div>
            <div class="clinic-info">
              New BEL Rd, Chikkamaranahalli, Dollars Colony, R.M.V. 2nd Stage<br/>
              Bengaluru, Karnataka 560094
            </div>
            <div class="clinic-info">
              📧 info@utpalaayurdhama.com | 📞 +91-7259195959, 080-4054-0333
            </div>
            <div class="gst-info">
              GSTIN: 29ACXPL2065P1ZL
            </div>
          </div>

          <!-- Title -->
          <div class="title">
            📋 DAILY EXPENSE REPORT
          </div>

          <!-- Info Section -->
          <div class="receipt-container">
            <div class="info-box">
              <table>
                <tr>
                  <td class="label">Expense Date</td>
                  <td class="colon">:</td>
                  <td class="value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="label">Report Generated</td>
                  <td class="colon">:</td>
                  <td class="value">${invoice.generatedAt}</td>
                </tr>
                <tr>
                  <td class="label">Total Items</td>
                  <td class="colon">:</td>
                  <td class="value">${expenses.length}</td>
                </tr>
              </table>
            </div>
            <div class="info-box">
              <table>
                <tr>
                  <td class="label">Receipt No</td>
                  <td class="colon">:</td>
                  <td class="value">${invoice.no}</td>
                </tr>
                <tr>
                  <td class="label">Generated By</td>
                  <td class="colon">:</td>
                  <td class="value">System Admin</td>
                </tr>
                <tr>
                  <td class="label">Status</td>
                  <td class="colon">:</td>
                  <td class="value">✅ Confirmed</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Expenses Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 35%">Expense Name</th>
                <th style="width: 10%">Qty</th>
                <th style="width: 20%">Payment Method</th>
                <th style="width: 15%">Rate (₹)</th>
                <th style="width: 15%">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${expensesRows}
              <tr class="total-row">
                <td colspan="4" style="text-align:right; font-weight:bold;">Sub Total</td>
                <td style="text-align:right; font-weight:bold;">₹${subtotal}</td>
                <td></td>
              </tr>
              <tr class="final-total">
                <td colspan="4" style="text-align:right; font-weight:bold; font-size:14px;">
                  Grand Total
                </td>
                <td colspan="2" style="text-align:right; font-weight:bold; font-size:14px; color: #8B4513;">
                  ₹${totalWithGst}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Amount in Words -->
          <div class="amount-words">
            <strong>💰 Amount in Words:</strong> ${amountInWords}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-left">
              <div class="footer-title">📞 REACH US AT</div>
              <div><span style="margin-right: 8px;">📧</span> info@utpalaayurdhama.com</div>
              <div><span style="margin-right: 8px;">📞</span> +91-7259195959</div>
              <div><span style="margin-right: 8px;">📞</span> 080-4054-0333</div>
            </div>
            <div class="footer-right">
              <div class="footer-title">🏥 OUR BRANCH</div>
              <div>
                <span style="margin-right: 8px;">📍</span> RAJESHWARI AYURDHAMA<br/>
                #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br/>
                Near Hesaraghatta Main Road, Bengaluru – 560073<br/>
                <span style="margin-right: 8px;">📧</span> rajeshwariayurdhama@gmail.com
              </div>
            </div>
          </div>

          <!-- Signature -->
          <div class="signature">
            <div>_________________________</div>
            <div style="margin-top: 5px;">Authorized Signatory</div>
          </div>
        </div>
      </body>
      </html>
    `;

    document.body.appendChild(container);

    // Give browser time to render
    await new Promise(r => setTimeout(r, 2000));

    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: false,
      onclone: (clonedDoc, element) => {
        // Ensure images are loaded in cloned document
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (img.src) {
            img.crossOrigin = "Anonymous";
          }
        });
      }
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    if (imgHeight <= pdfHeight) {
      // Single page
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multiple pages
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      let heightLeft = imgHeight - pdfHeight;
      position = -pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }
    }

    pdf.save(`Expense_Report_${formattedDate.replace(/-/g, "")}.pdf`);
    toast.dismiss("expense-loading");
    toast.success("Expense report downloaded successfully");

  } catch (error) {
    console.error("Error generating expense report:", error);
    toast.dismiss("expense-loading");

    const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
    toast.error(`Error generating expense report: ${errorMessage}`);
  }
};