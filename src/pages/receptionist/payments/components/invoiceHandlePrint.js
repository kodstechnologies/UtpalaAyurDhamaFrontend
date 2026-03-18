
import logo from "../../../../assets/logo/logo2.png";

// Simple Indian rupees number to words
const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };

  return convert(Math.round(num));
};

const formatCurrency = (amount) => {
  return Number(amount || 0).toFixed(2);
};

const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString("en-IN");
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Categorize items for the bill
const categorizeItem = (item) => {
  if (item.category) {
    const map = {
      consultation: "Doctor Consultation",
      therapy: "Therapy",
      pharmacy: "Medicines",
      food: "Food Charges",
      ward: "Bed Charges",
    };
    return map[item.category.toLowerCase()] || item.category;
  }

  const name = (item.name || "").toLowerCase();
  if (name.includes("consultation") || name.includes("doctor") || name.includes("opd")) return "Doctor Consultation";
  if (name.includes("therapy") || name.includes("session") || name.includes("treatment")) return "Therapy";
  if (name.includes("food") || name.includes("meal") || name.includes("breakfast") || name.includes("lunch") || name.includes("dinner")) return "Food Charges";
  if (name.includes("ward") || name.includes("bed") || name.includes("room")) return "Bed Charges";
  if (name.includes("medicine") || name.includes("tablet") || name.includes("syrup") || name.includes("capsule")) return "Medicines";
  return "Other";
};

/**
 * Print invoice bill using the invoice object from InvoiceDetails page
 * @param {Object} invoice - The invoice object already loaded on the page
 */
export const invoiceHandlePrint = async (invoice) => {
  if (!invoice) {
    alert("No invoice data available");
    return;
  }

  const patient = {
    name: invoice.patient?.user?.name || invoice.patient?.name || "N/A",
    gender: invoice.patient?.user?.gender || invoice.patient?.gender || "N/A",
    age: invoice.patient?.age || "N/A",
    phone: invoice.patient?.user?.phone || "N/A",
    email: invoice.patient?.user?.email || "N/A",
    uhid: invoice.patient?.uhid || invoice.patient?.patientId || "",
    address: invoice.patient?.user?.address || "N/A",
  };

  const doctorName = invoice.doctor
    ? (invoice.doctor.firstName ? `${invoice.doctor.firstName} ${invoice.doctor.lastName}` : invoice.doctor.user?.name || "N/A")
    : "N/A";

  const invoiceDate = formatDate(invoice.createdAt);
  const invoiceNo = invoice.invoiceNumber || "N/A";

  // Group items by category
  const items = invoice.items || [];
  const grouped = {};
  items.forEach((item) => {
    const cat = categorizeItem(item);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const categoryOrder = ["Doctor Consultation", "Therapy", "Medicines", "Food Charges", "Bed Charges", "Other"];

  // Build item rows grouped by category
  let counter = 0;
  let itemsHtml = "";

  categoryOrder.forEach((cat) => {
    const catItems = grouped[cat];
    if (!catItems || catItems.length === 0) return;

    const catTotal = catItems.reduce((sum, i) => sum + (i.total || i.amount || 0), 0);

    // Category header row
    itemsHtml += `
      <tr style="background:#e8f4f8;">
        <td colspan="5" style="border:1px solid #000; padding:6px; font-weight:bold; font-size:12px;">${cat}</td>
        <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; font-size:12px;">₹${formatCurrency(catTotal)}</td>
      </tr>
    `;

    // Item rows
    catItems.forEach((item) => {
      counter++;
      const qty = item.dispensedQuantity || item.quantity || 1;
      const unitPrice = item.unitPrice || item.amount || 0;
      const total = item.total || item.amount || 0;

      itemsHtml += `
        <tr>
          <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${counter}</td>
          <td style="border:1px solid #000; padding:5px; font-size:11px;">${item.name || "Item"}</td>
          <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${item.description || ""}</td>
          <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${qty}</td>
          <td style="border:1px solid #000; padding:5px; text-align:right; font-size:11px;">₹${formatCurrency(unitPrice)}</td>
          <td style="border:1px solid #000; padding:5px; text-align:right; font-size:11px;">₹${formatCurrency(total)}</td>
        </tr>
      `;
    });
  });

  // Totals
  const subtotal = invoice.subtotal || 0;
  const discount = invoice.discountValue || 0;
  const discountText = invoice.discountType === "percentage"
    ? `Discount (${invoice.discountRate || 0}%)`
    : discount > 0 ? "Discount (Fixed)" : "";
  const totalPayable = invoice.totalPayable || 0;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = totalPayable - amountPaid;
  const paymentStatus = amountPaid >= totalPayable ? "PAID" : amountPaid > 0 ? "PARTIALLY PAID" : "UNPAID";
  const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#f57c00" : "#d32f2f";
  const amountInWords = `Rupees ${numberToWords(Math.round(totalPayable))} Only`;

  const html = `
  <html>
  <head>
    <title>Invoice - Utpala Ayurdhama - ${invoiceNo}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        margin: 10px auto;
        color: #000;
        border: 1px solid black;
        max-width: 50rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        min-height: 297mm;
      }
      .header {
        background: #fff3e0;
        padding: 10px;
        text-align: center;
        border-bottom: 2px solid #000;
      }
      .header img { height: 100px; }
      .header .title { font-size: 24px; font-weight: bold; color: #5d4037; margin: 5px 0; }
      .header .subtitle { font-size: 11px; color: #555; margin: 3px 0; }
      .header .invoice-title {
        font-size: 18px;
        font-weight: bold;
        background: #5d4037;
        color: white;
        padding: 6px 20px;
        display: inline-block;
        margin-top: 8px;
        border-radius: 4px;
      }
      .info-container { display: flex; border: 1px solid #000; margin: 0; }
      .patient-box { width: 60%; background: #fafafa; padding: 12px; border-right: 1px solid #000; }
      .receipt-box { width: 40%; background: #fafafa; }
      .receipt-title { text-align: center; font-weight: bold; font-size: 16px; border-bottom: 1px solid #000; padding: 8px; background: #f5f0eb; }
      .info-table { width: 100%; font-size: 12px; }
      .info-table td { padding: 3px 6px; }
      .info-table .label { font-weight: bold; width: 100px; }
      .items-table { width: 100%; border-collapse: collapse; }
      .items-table th { border: 1px solid #000; padding: 6px; font-size: 11px; background: #f5f0eb; text-align: center; font-weight: bold; }
      .summary-container { display: flex; border-top: 2px solid #000; margin-top: 10px; }
      .summary-left { width: 55%; padding: 12px; border-right: 1px solid #000; }
      .summary-right { width: 45%; padding: 12px; }
      .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
      .summary-row.total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 13px;
        margin-top: 5px;
      }
      .footer {
        margin-top: auto;
        background: #5d4037;
        color: #fff;
        display: flex;
        justify-content: space-between;
        padding: 15px 20px;
        font-size: 11px;
      }
      .footer-left { width: 40%; }
      .footer-right { width: 55%; }
      .footer-title { font-weight: bold; margin-bottom: 6px; font-size: 13px; }
      .footer-divider { width: 2px; background: rgba(255,255,255,0.5); margin: 0 15px; }
      @media print { body { border: none; margin: 0; } }
    </style>
  </head>
  <body>

    <!-- HEADER -->
    <div class="header">
      <img src="${logo}" alt="Logo" />
      <div class="title">Utpala Ayurdhama</div>
      <div class="subtitle">
        New BEL Rd, Chikkamaranahalli, Dollars Colony, R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
      </div>
      <div class="subtitle">✉ info@utpalaayurdhama.com &nbsp; ✆ +91-7259195959 &nbsp; GSTIN: 29ACXPL2065P1ZL</div>
      <div class="invoice-title">TAX INVOICE</div>
    </div>

    <!-- PATIENT + RECEIPT INFO -->
    <div class="info-container">
      <div class="patient-box">
        <table class="info-table">
          <tr><td class="label">NAME</td><td>:</td><td>${patient.name}</td></tr>
          ${doctorName !== "N/A" ? `<tr><td class="label">DOCTOR</td><td>:</td><td>${doctorName}</td></tr>` : ""}
          ${patient.uhid ? `<tr><td class="label">UHID</td><td>:</td><td>${patient.uhid}</td></tr>` : ""}
          <tr><td class="label">AGE/GENDER</td><td>:</td><td>${patient.age} / ${patient.gender}</td></tr>
          ${patient.phone !== "N/A" ? `<tr><td class="label">PHONE</td><td>:</td><td>${patient.phone}</td></tr>` : ""}
          ${patient.email !== "N/A" ? `<tr><td class="label">E-MAIL</td><td>:</td><td>${patient.email}</td></tr>` : ""}
          ${patient.address !== "N/A" ? `<tr><td class="label">ADDRESS</td><td>:</td><td>${patient.address}</td></tr>` : ""}
        </table>
      </div>
      <div class="receipt-box">
        <div class="receipt-title">INVOICE DETAILS</div>
        <table class="info-table" style="padding:10px;">
          <tr><td class="label">Invoice No:</td><td>${invoiceNo}</td></tr>
          <tr><td class="label">Date:</td><td>${invoiceDate}</td></tr>
          <tr><td class="label">Time:</td><td>${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td></tr>
          <tr>
            <td class="label">Status:</td>
            <td><span class="status-badge" style="background:${statusColor}; color:white;">${paymentStatus}</span></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:40px;">Srl</th>
          <th>Item Name</th>
          <th>Description</th>
          <th style="width:60px;">Qty</th>
          <th style="width:90px;">Unit Price</th>
          <th style="width:90px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="font-weight:bold; background:#f5f0eb;">
          <td colspan="5" style="border:1px solid #000; padding:6px; font-size:12px;">SUBTOTAL</td>
          <td style="border:1px solid #000; padding:6px; text-align:right; font-size:12px;">₹${formatCurrency(subtotal)}</td>
        </tr>
      </tbody>
    </table>

    <!-- SUMMARY -->
    <div class="summary-container">
      <div class="summary-left">
        <div style="font-weight:bold; margin-bottom:8px; font-size:13px;">Amount in Words:</div>
        <div style="font-style:italic; font-size:12px;">${amountInWords}</div>
        ${invoice.payments && invoice.payments.length > 0 ? `
          <div style="margin-top:15px; font-weight:bold; font-size:13px;">Payment History:</div>
          ${invoice.payments.map((p, i) => `
            <div style="font-size:11px; margin-top:4px;">
              ${i + 1}. ₹${formatCurrency(p.amount)} via ${p.method || "Cash"} on ${formatDate(p.paidAt || p.createdAt)}
            </div>
          `).join("")}
        ` : ""}
      </div>
      <div class="summary-right">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>₹${formatCurrency(subtotal)}</span>
        </div>
        ${discount > 0 ? `
          <div class="summary-row" style="color:#2e7d32;">
            <span>${discountText}:</span>
            <span>-₹${formatCurrency(discount)}</span>
          </div>
        ` : ""}
        <div class="summary-row total">
          <span>TOTAL PAYABLE:</span>
          <span>₹${formatCurrency(totalPayable)}</span>
        </div>
        <div class="summary-row">
          <span>Amount Paid:</span>
          <span style="color:#2e7d32;">₹${formatCurrency(amountPaid)}</span>
        </div>
        <div class="summary-row" style="font-weight:bold; font-size:13px; color:${statusColor};">
          <span>Balance Due:</span>
          <span>₹${formatCurrency(balanceDue)}</span>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-title">REACH US AT</div>
        <div>✉ info@utpalaayurdhama.com</div>
        <div>✆ +91-7259195959</div>
        <div>✆ 080-4054-0333</div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-right">
        <div class="footer-title">OUR BRANCH(S)</div>
        <div>
          📍 RAJESHWARI AYURDHAMA<br>
          #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br>
          Near Hesaraghatta Main Road, Bengaluru – 560073<br>
          ✉ rajeshwariayurdhama@gmail.com
        </div>
      </div>
    </div>

    <script>
      window.onload = function () {
        window.print();
        window.onafterprint = function () { window.close(); };
      };
    </script>
  </body>
  </html>
  `;

  const printWindow = window.open("", "_blank", "width=950,height=800");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert("Please allow popups to print the invoice.");
  }
};