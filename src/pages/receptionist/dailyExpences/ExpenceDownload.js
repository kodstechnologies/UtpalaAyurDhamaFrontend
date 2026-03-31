import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import logo from "../../../assets/logo/logo2.png";
import { getFooter } from "../../../components/pdf/pdfFooter";
import { getHeader } from "../../../components/pdf/pdfHeader";

// Number to words (Indian style)
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  let str = "";
  let i = 0;
  num = Math.round(num);

  while (num > 0) {
    let part = i === 0 ? num % 1000 : num % 100;
    if (part > 0) {
      let partStr = "";
      const hundreds = Math.floor(part / 100);
      const remainder = part % 100;

      if (hundreds > 0) partStr += ones[hundreds] + " Hundred ";
      if (remainder > 0) {
        if (remainder < 20) partStr += ones[remainder];
        else partStr += tens[Math.floor(remainder / 10)] + (remainder % 10 ? " " + ones[remainder % 10] : "");
      }
      str = partStr.trim() + (scales[i] ? " " + scales[i] : "") + (str ? " " + str : "");
    }
    num = i === 0 ? Math.floor(num / 1000) : Math.floor(num / 100);
    i++;
  }
  return str.trim() || "Zero";
};

export const handleDownload = async (dateStr) => {

  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

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

    // Get unique approvers
    const approvers = [...new Set(expenses.map(item => item.approvedBy).filter(approver => approver))];
    const approvedBy = approvers.length > 0 ? approvers.join(", ") : "Not Specified";

    // Financials
    const calculatedTotal = expenses.reduce((sum, item) => sum + (item.cost || 0), 0);
    const finalTotal = totalAmount || calculatedTotal;
    const finalTotalStr = finalTotal.toFixed(2);
    const amountInWords = `Rupees ${numberToWords(finalTotal)} Only`;

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

    // Prepare table rows
    const expensesRows = expenses.map((item, i) => {
      const qty = Number(item.count || 1);
      const total = Number(item.cost || 0);
      const rate = qty > 0 ? total / qty : 0;
      const paymentMethod = item.method || item.paymentMethod || "Cash";
      const expenseName = item.name || item.type || "Unknown Item";
      const approvedByName = item.approvedBy || "-";

      return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:8px; font-size:11px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:8px; font-size:11px;">${escapeHtml(expenseName)}</td>
          <td style="text-align:center; border:1px solid #000; padding:8px; font-size:11px;">${qty}</td>
          <td style="text-align:center; border:1px solid #000; padding:8px; font-size:11px;">
            ${escapeHtml(paymentMethod)}
            ${item.transactionId ? `<br/><small style="color:#666; font-size:9px;">ID: ${escapeHtml(item.transactionId)}</small>` : ""}
            ${item.lastFourDigits ? `<br/><small style="color:#666; font-size:9px;">Card: ****${escapeHtml(item.lastFourDigits)}</small>` : ""}
          </td>
          <td style="text-align:center; border:1px solid #000; padding:8px; font-size:11px;">${escapeHtml(approvedByName)}</td>
          <td style="text-align:right; border:1px solid #000; padding:8px; font-size:11px;">₹${total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    // ────────────────────────────────────────────────
    // HTML Container for PDF
    // ────────────────────────────────────────────────
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "794px";
    container.style.minHeight = "1123px";
    container.style.padding = "20px 18px";
    container.style.boxSizing = "border-box";
    container.style.fontFamily = "Arial, Helvetica, sans-serif";
    container.style.fontSize = "12px";
    container.style.background = "#fff";

    container.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

      ${getHeader(logo)}

      <!-- Title -->
      <div style="font-size:22px; font-weight:bold; margin:20px 0; text-align:center; color:#8B4513; text-transform:uppercase; letter-spacing:2px; background:#f9f5f0; padding:12px; border-radius:8px;">
        📋 DAILY EXPENSE REPORT
      </div>

      <!-- Receipt Info -->
      <div style="display:flex; border:1px solid #ddd; margin-bottom:20px; background:#fafafa; border-radius:8px; overflow:hidden;">
        <div style="width:50%; padding:15px; border-right:1px solid #ddd;">
          <table style="width:100%; font-size:13px;">
            <tr><td style="font-weight:bold; width:110px; color:#555;">Expense Date</td><td style="width:15px;">:</td><td style="color:#333;">${formattedDate}</td></tr>
            <tr><td style="font-weight:bold; color:#555;">Approved By</td><td>:</td><td style="color:#333;">${escapeHtml(approvedBy)}</td></tr>
            <tr><td style="font-weight:bold; color:#555;">Report Generated</td><td>:</td><td style="color:#333;">${invoice.generatedAt}</td></tr>
            <tr><td style="font-weight:bold; color:#555;">Total Items</td><td>:</td><td style="color:#333;">${expenses.length}</td></tr>
          </table>
        </div>
        <div style="width:50%; padding:15px;">
          <table style="width:100%; font-size:13px;">
            <tr><td style="font-weight:bold; width:110px; color:#555;">Receipt No</td><td style="width:15px;">:</td><td style="color:#333;">${invoice.no}</td></tr>
            <tr><td style="font-weight:bold; color:#555;">Generated By</td><td>:</td><td style="color:#333;">${receptionistName}</td></tr>
             <tr><td style="font-weight:bold; color:#555;"></td><td></td><td style="color:#333;">Receptionist</td></tr>
            <tr><td style="font-weight:bold; color:#555;">Status</td><td>:</td><td style="color:#333;">✅ Confirmed</td></tr>
          </table>
        </div>
      </div>

      <!-- Table Section -->
      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:center; color:#555; width:5%;">#</th>
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:left; color:#555;">Expense Name</th>
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:center; color:#555; width:8%;">Qty</th>
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:center; color:#555; width:15%;">Method</th>
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:center; color:#555; width:18%;">Approved By</th>
            <th style="border:1px solid #000; padding:10px; font-weight:bold; text-align:right; color:#555; width:12%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${expensesRows}
          <tr style="background:#f9f9f9;">
            <td colspan="5" style="border:1px solid #000; padding:10px; text-align:right; font-weight:bold;">Sub Total</td>
            <td style="border:1px solid #000; padding:10px; text-align:right; font-weight:bold;">₹${finalTotalStr}</td>
          </tr>
          <tr style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
            <td colspan="5" style="border:1px solid #000; padding:12px; text-align:right; font-weight:bold; font-size:14px;">Grand Total</td>
            <td style="border:1px solid #000; padding:12px; text-align:right; font-weight:bold; font-size:14px; color:#8B4513;">₹${finalTotalStr}</td>
          </tr>
        </tbody>
      </table>

      ${getFooter()}
    `;

    document.body.appendChild(container);

    // Give browser time to render
    await new Promise(r => setTimeout(r, 1500));

    const canvas = await html2canvas(container, {
      scale: 2.8,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      height: container.scrollHeight,
      windowHeight: container.scrollHeight,
      allowTaint: true,
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

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');

    let heightLeft = imgHeight - pdfHeight;
    let position = -pdfHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      position -= pdfHeight;
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