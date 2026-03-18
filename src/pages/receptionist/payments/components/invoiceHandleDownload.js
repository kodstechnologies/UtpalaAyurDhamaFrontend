import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
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

// Categorize items (same logic as print)
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
 * Download invoice PDF using the invoice object from InvoiceDetails page
 * @param {Object} invoice - The invoice object already loaded on the page
 */
export const invoiceHandleDownload = async (invoice) => {
  if (!invoice) {
    toast.error("No invoice data available");
    return;
  }

  try {
    const patient = {
      name: invoice.patient?.user?.name || invoice.patient?.name || "N/A",
      gender: invoice.patient?.user?.gender || invoice.patient?.gender || "N/A",
      age: invoice.patient?.age || "N/A",
      uhid: invoice.patient?.uhid || invoice.patient?.patientId || "",
      phone: invoice.patient?.user?.phone || "N/A",
      email: invoice.patient?.user?.email || "N/A",
      address: invoice.patient?.user?.address || "N/A",
    };

    const doctorName = invoice.doctor
      ? (invoice.doctor.firstName ? `${invoice.doctor.firstName} ${invoice.doctor.lastName}` : invoice.doctor.user?.name || "N/A")
      : "N/A";

    const invoiceDate = formatDate(invoice.createdAt);
    const invoiceNo = invoice.invoiceNumber || "N/A";

    // Group items by category (same as print)
    const items = invoice.items || [];
    const grouped = {};
    items.forEach((item) => {
      const cat = categorizeItem(item);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const categoryOrder = ["Doctor Consultation", "Therapy", "Medicines", "Food Charges", "Bed Charges", "Other"];

    let counter = 0;
    let itemsHtml = "";

    categoryOrder.forEach((cat) => {
      const catItems = grouped[cat];
      if (!catItems || catItems.length === 0) return;

      const catTotal = catItems.reduce((sum, i) => sum + (i.total || i.unitPrice * i.quantity || 0), 0);

      itemsHtml += `
        <tr style="background:#e8f4f8;">
          <td colspan="5" style="border:1px solid #000; padding:6px; font-weight:bold; font-size:12px;">${cat}</td>
          <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; font-size:12px;">₹${formatCurrency(catTotal)}</td>
        </tr>
      `;

      catItems.forEach((item) => {
        counter++;
        const qty = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const total = item.total || (unitPrice * qty);

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

    // ── Create off-screen container matching Print layout exactly ──
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px"; // Standard A4 width at 96 DPI
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.fontFamily = "Arial, Helvetica, sans-serif";
    container.style.border = "1px solid #000";

    container.innerHTML = `
      <div style="text-align:center; background:#fff3e0; padding:15px; border:2px solid #000; margin-bottom:10px;">
        <img src="${logo}" style="height:100px; margin-bottom:10px;" />
        <div style="font-size:24px; font-weight:bold; color:#5d4037;">Utpala Ayurdhama</div>
        <div style="font-size:11px; margin:5px 0;">New BEL Rd, Chikkamaranahalli, Bangalore 560094</div>
        <div style="font-size:11px;">✉ info@utpalaayurdhama.com &nbsp;|&nbsp; ✆ +91-7259195959</div>
        <div style="font-size:18px; font-weight:bold; background:#5d4037; color:white; padding:6px 20px; display:inline-block; margin-top:10px; border-radius:4px;">TAX INVOICE</div>
      </div>

      <div style="display:flex; border:1px solid #000; margin-bottom:10px;">
        <div style="width:60%; padding:10px; border-right:1px solid #000; background:#f9f9f9;">
          <table style="width:100%; font-size:12px;">
            <tr><td style="font-weight:bold; width:100px;">NAME</td><td>: ${patient.name}</td></tr>
            ${doctorName !== "N/A" ? `<tr><td style="font-weight:bold;">DOCTOR</td><td>: ${doctorName}</td></tr>` : ""}
            ${patient.uhid ? `<tr><td style="font-weight:bold;">UHID</td><td>: ${patient.uhid}</td></tr>` : ""}
            <tr><td style="font-weight:bold;">AGE/GENDER</td><td>: ${patient.age} / ${patient.gender}</td></tr>
            ${patient.phone !== "N/A" ? `<tr><td style="font-weight:bold;">PHONE</td><td>: ${patient.phone}</td></tr>` : ""}
            ${patient.email !== "N/A" ? `<tr><td style="font-weight:bold;">EMAIL</td><td>: ${patient.email}</td></tr>` : ""}
          </table>
        </div>
        <div style="width:40%; padding:10px; background:#f9f9f9;">
          <div style="text-align:center; font-weight:bold; border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:5px;">INVOICE DETAILS</div>
          <table style="width:100%; font-size:12px;">
            <tr><td style="font-weight:bold;">No:</td><td>${invoiceNo}</td></tr>
            <tr><td style="font-weight:bold;">Date:</td><td>${invoiceDate}</td></tr>
            <tr><td style="font-weight:bold;">Status:</td><td><span style="color:${statusColor}; font-weight:bold;">${paymentStatus}</span></td></tr>
          </table>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr style="background:#f5f0eb;">
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Srl</th>
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Item Name</th>
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Description</th>
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Qty</th>
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Price</th>
            <th style="border:1px solid #000; padding:6px; font-size:11px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="font-weight:bold; background:#f5f0eb;">
            <td colspan="5" style="border:1px solid #000; padding:6px;">SUBTOTAL</td>
            <td style="border:1px solid #000; padding:6px; text-align:right;">₹${formatCurrency(subtotal)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; border:1px solid #000; padding:10px; background:#f9f9f9;">
        <div style="width:55%;">
          <div style="font-weight:bold; font-size:12px; margin-bottom:5px;">Amount in Words:</div>
          <div style="font-style:italic; font-size:11px;">${amountInWords}</div>
        </div>
        <div style="width:45%; padding-left:20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
            <span>Subtotal:</span><span>₹${formatCurrency(subtotal)}</span>
          </div>
          ${discount > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px; color:#2e7d32;">
            <span>${discountText}:</span><span>-₹${formatCurrency(discount)}</span>
          </div>` : ""}
          <div style="display:flex; justify-content:space-between; margin-top:8px; border-top:2px solid #000; padding-top:4px; font-weight:bold; font-size:13px;">
            <span>TOTAL:</span><span>₹${formatCurrency(totalPayable)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:12px; color:#2e7d32;">
            <span>Paid:</span><span>₹${formatCurrency(amountPaid)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px; font-weight:bold; color:${statusColor}; font-size:13px;">
            <span>Balance:</span><span>₹${formatCurrency(balanceDue)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:20px; text-align:center; font-size:10px; color:#666; border-top:1px dashed #ccc; padding-top:10px;">
        This is a computer generated invoice.
      </div>
    `;

    document.body.appendChild(container);

    // Render to Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${invoiceNo.replace(/[\/\\]/g, "-")}.pdf`);

    toast.success("Invoice PDF downloaded successfully");

  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF");
  }
};