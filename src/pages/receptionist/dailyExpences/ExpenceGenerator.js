import axios from "axios";
import logo from "../../../assets/logo/logo2.png";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { pdfPrHeader } from "../../../components/pdf/pdfPrHeader";
import { getFooter } from "../../../components/pdf/pdfFooter";

// Indian rupees number to words with proper Indian numbering system
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

export const handlePrint = async (dateStr) => {
  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;
  try {
    // Validate date
    if (!dateStr) {
      alert("Please select a date");
      return;
    }

    const [year, month, day] = dateStr.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    // Show loading in a modal or alert
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      text-align: center;
      font-family: Arial, sans-serif;
    `;
    loadingDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #8B4513; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
      <div>Loading Expense Report...</div>
      <div style="font-size: 12px; color: #666; margin-top: 8px;">Please wait while we fetch the data</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    const response = await axios.get(
      getApiUrl("expense/expenseItem"),
      {
        headers: getAuthHeaders(),
        params: { date: formattedDate },
      }
    );

    console.log("API Response:", response.data);

    // Access expenses from the correct path
    const expenses = response.data?.data?.expenses || [];
    const totalAmount = response.data?.data?.total || 0;

    // Remove loading div
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }

    if (!expenses || expenses.length === 0) {
      alert(`No expenses found for date: ${formattedDate}`);
      return;
    }

    // Calculate total if not provided
    const calculatedTotal = expenses.reduce((sum, item) => sum + (item.cost || 0), 0);
    const finalTotal = totalAmount || calculatedTotal;

    // Get unique approvers (if multiple expenses have different approvers, show all or first one)
    const approvers = [...new Set(expenses.map(item => item.approvedBy).filter(approver => approver))];
    const approvedBy = approvers.length > 0 ? approvers.join(", ") : "Not Specified";

    const invoice = {
      no: "EXP-" + formattedDate.replace(/-/g, "") + "-" + new Date().getTime(),
      date: formattedDate,
      generatedAt: new Date().toLocaleString(),
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (!text) return "";
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Map expenses to table rows with proper formatting
    const expensesRows = expenses.map((item, i) => {
      const qty = Number(item.count || 1);
      const total = Number(item.cost || 0);
      const paymentMethod = item.method || item.paymentMethod || "Cash";
      const expenseName = item.name || item.type || "Unknown Item";
      const approvedByName = item.approvedBy || "-";

      return `
        <tr>
          <td style="text-align:center; padding: 8px;">${i + 1}</td>
          <td style="padding: 8px;">${escapeHtml(expenseName)}</td>
          <td style="text-align:center; padding: 8px;">${qty}</td>
          <td style="text-align:center; padding: 8px;">
            ${escapeHtml(paymentMethod)}
            ${item.transactionId ? `<br/><small style="color:#666; font-size:9px;">ID: ${escapeHtml(item.transactionId)}</small>` : ""}
            ${item.lastFourDigits ? `<br/><small style="color:#666; font-size:9px;">Card: ****${escapeHtml(item.lastFourDigits)}</small>` : ""}
          </td>
          <td style="text-align:center; padding: 8px;">${escapeHtml(approvedByName)}</td>
          <td style="text-align:right; padding: 8px;">₹${total.toFixed(2)}</td>
         </tr>
      `;
    }).join("");

    const subtotal = finalTotal.toFixed(2);
    const totalWithGst = finalTotal.toFixed(2);
    const amountInWords = `Rupees ${numberToWords(Math.round(finalTotal))} Only`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report - Utpala Ayurdhama</title>
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
        .main-content { padding: 10px; width: 100%; }
        .title {
          font-size: 22px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
          color: #8B4513;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .receipt-container {
          display: flex;
          border: 1px solid #ddd;
          margin: 20px 0;
          background: #fafafa;
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
          border-collapse: collapse;
          font-size: 12px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 10px 8px;
        }
        .items-table th {
          background: #f5f5f5;
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
          background: #e8f5e9;
        }
        .final-total td {
          font-weight: bold;
          font-size: 14px;
        }
        @media print {
          body { border: none; margin: 0; width: 100%; max-width: none; }
          .report-header { display: table-header-group; }
          .report-footer { position: fixed; bottom: 0; left: 0; right: 0; max-width: 100%; width: 100%; margin: 0 auto; }
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
                <!-- Title -->
                <div class="title">📋 DAILY EXPENSE REPORT</div>

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
                        <td class="label">Approved By</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(approvedBy)}</td>
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
                        <td class="value">${receptionistName}</td>
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
                      <th style="width: 30%">Expense Name</th>
                      <th style="width: 8%">Qty</th>
                      <th style="width: 15%">Payment Method</th>
                      <th style="width: 18%">Approved By</th>
                      <th style="width: 12%">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expensesRows}
                    <tr class="total-row">
                      <td colspan="5" style="text-align:right; font-weight:bold;">Sub Total</td>
                      <td style="text-align:right; font-weight:bold;">₹${subtotal}</td>
                    </tr>
                    <tr class="final-total">
                      <td colspan="5" style="text-align:right; font-weight:bold; font-size:14px;">
                        Grand Total
                      </td>
                      <td colspan="1" style="text-align:right; font-weight:bold; font-size:14px; color: #8B4513;">
                        ₹${totalWithGst}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
          }, 1000);
          window.onafterprint = function() {};
        };
      </script>
    </body>
    </html>
    `;

    // Try to open a new window with user interaction first
    const printWindow = window.open("", "_blank", "width=1000,height=800,scrollbars=yes,toolbar=yes,menubar=yes");

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      // If popup is blocked, show instructions and create a fallback
      alert("Popup blocked! Please allow popups for this website to print the report.\n\nIf you're using Chrome, click the popup blocked icon in the address bar and select 'Always allow popups'.\n\nAlternatively, you can copy the report data from the console.");

      // Create a fallback iframe
      const fallbackDiv = document.createElement('div');
      fallbackDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 10000;
        overflow: auto;
        padding: 20px;
      `;

      fallbackDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h3>Popup Blocked</h3>
          <p>Please allow popups to print the report, or click the button below to print.</p>
          <button onclick="window.print()" style="padding: 10px 20px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-print"></i> Print This Page
          </button>
          <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; margin-left: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
        <div id="report-content"></div>
      `;

      document.body.appendChild(fallbackDiv);

      const reportContent = fallbackDiv.querySelector('#report-content');
      reportContent.innerHTML = html;

      // Add print functionality
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body > div:first-child {
            display: none;
          }
          #report-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }

  } catch (error) {
    console.error("Error fetching expense report:", error);
    // Remove loading div if exists
    const loadingDiv = document.querySelector('div[style*="position: fixed"]');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }

    const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
    alert(`Error fetching expense report: ${errorMessage}`);
  }
};