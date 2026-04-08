import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import { getFooter } from "../../../../components/pdf/pdfFooter";
import { getHeader } from "../../../../components/pdf/pdfHeader";

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

    // Financials
    const subtotal = Number(data.subtotal || 0).toFixed(2);
    const gstAmount = Number(data.gstAmount || 0).toFixed(2);
    const totalWithGst = Number(data.totalWithGst || 0).toFixed(2);

    // GST rate display
    let gstRateText = "";
    if (gstAmount > 0 && subtotal > 0) {
      const calculatedRate = (gstAmount / subtotal) * 100;
      gstRateText = `${Math.round(calculatedRate)}%`;
    }

    const amountInWords = `Rupees ${numberToWords(Math.round(totalWithGst))} Only`;

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
          margin: 0;
          padding: 20px;
          color: #000;
          background: #fff;
        }
        .print-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 1px solid #000;
          min-height: 297mm;
          display: flex;
          flex-direction: column;
        }
        .content {
          flex: 1;
          padding: 20px;
        }
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
        .amount-words {
          margin: 16px 0;
          padding: 12px;
          background: #fff3e0;
          border-left: 4px solid #8B4513;
          font-style: italic;
          font-size: 12px;
        }
        .notes-section {
          margin: 16px 0;
          padding: 12px;
          background: #f9f5f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 11px;
        }
        .notes-section ul {
          margin-top: 8px;
          margin-left: 20px;
        }
        .notes-section li {
          margin-bottom: 4px;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .print-container {
            border: none;
            margin: 0;
            min-height: auto;
          }
          .content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        ${getHeader()}
        
        <div class="content">
          <!-- Patient + Prescription Info -->
          <div class="info-container">
            <div class="patient-box">
              <table class="info-table">
                <tr><td class="label">Patient Name</td><td>:</td><td>${escapeHtml(patient.name)}</td></tr>
                <tr><td class="label">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
                <tr><td class="label">Mobile No</td><td>:</td><td>${escapeHtml(patient.mobile)}</td></tr>
                 <tr><td class="label">Generated By</td><td>:</td><td>${receptionistName}</td></tr>
                
              </table>
            </div>
            <div class="receipt-box">
              <div class="receipt-title">PRESCRIPTION</div>
              <table class="info-table" style="margin-top:8px;">
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
              ${gstAmount > 0 ? `
                <tr class="total-row">
                  <td colspan="4" style="text-align:right; font-weight:bold;">GST (${gstRateText})</td>
                  <td style="text-align:right; font-weight:bold;">₹${gstAmount}</td>
                </tr>
              ` : ''}
              
              <!-- Grand Total -->
              <tr class="final-total" >
                <td colspan="4" style="text-align:right; font-weight:bold; font-size:13px;">Total (with GST)</td>
                <td style="text-align:right; font-weight:bold; font-size:13px; color:#8B4513;">₹${totalWithGst}</td>
              </tr>
            </tbody>
          </table>

     

  

        ${getFooter()}
      </div>

      <script>
        // Ensure proper print handling
        (function() {
          // Wait for all content to load
          window.addEventListener('load', function() {
            // Small delay to ensure all content is rendered
            setTimeout(function() {
              // Trigger print dialog
              window.print();
            }, 300);
          });
          
          // Handle after print - don't close immediately, wait for user
          let printTimeout;
          window.onafterprint = function() {
            // Add a small delay before closing to ensure user sees the print dialog closed
            if (printTimeout) clearTimeout(printTimeout);
            printTimeout = setTimeout(function() {
              // Only close if this is a popup window
              if (window.opener && !window.opener.closed) {
                window.close();
              }
            }, 1000);
          };
          
          // Handle before print to ensure layout is ready
          window.onbeforeprint = function() {
            // Optional: Add any pre-print adjustments
            document.body.style.margin = '0';
            document.body.style.padding = '0';
          };
        })();
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