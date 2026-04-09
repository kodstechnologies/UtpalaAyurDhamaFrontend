import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
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

    // ── Helper: render an HTML string to a canvas ──
    const renderToCanvas = async (html, width = 794) => {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "0";
      el.style.width = width + "px";
      el.style.background = "#fff";
      el.style.fontFamily = "Arial, Helvetica, sans-serif";
      el.style.color = "#000";
      el.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
        ${html}
      `;
      document.body.appendChild(el);
      await new Promise((r) => setTimeout(r, 500));
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: width,
        windowHeight: el.scrollHeight,
      });
      document.body.removeChild(el);
      return canvas;
    };

    // ── Render header, footer, and body as separate canvases ──
    const headerHtml = `<div style="width:794px; box-sizing:border-box; padding:15px 15px 0;">${getHeader()}</div>`;
    const footerHtml = `<div style="width:794px; box-sizing:border-box; padding:0 15px 15px;">${getFooter()}</div>`;

    const bodyHtml = `
      <div style="width:794px; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">
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
      </div>
    `;

    // Render all three parts
    const [headerCanvas, footerCanvas, bodyCanvas] = await Promise.all([
      renderToCanvas(headerHtml),
      renderToCanvas(footerHtml),
      renderToCanvas(bodyHtml),
    ]);

    // Create PDF
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pdfW - margin * 2;

    const pxToMm = (canvas) => (canvas.height / canvas.width) * contentW;

    const headerH = pxToMm(headerCanvas);
    const footerH = pxToMm(footerCanvas);
    const bodyTotalH = pxToMm(bodyCanvas);

    const topPad = 5;
    const botPad = 5;
    const bodyAreaH = pdfH - headerH - footerH - topPad - botPad;

    const headerImg = headerCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const totalPages = Math.ceil(bodyTotalH / bodyAreaH);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Draw header
      pdf.addImage(headerImg, "PNG", margin, 0, contentW, headerH);

      // Draw body slice
      const bodyY = headerH + topPad;
      const srcYPx = (page * bodyAreaH / bodyTotalH) * bodyCanvas.height;
      const srcHPx = Math.min(
        (bodyAreaH / bodyTotalH) * bodyCanvas.height,
        bodyCanvas.height - srcYPx
      );

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = bodyCanvas.width;
      sliceCanvas.height = Math.round(srcHPx);
      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        bodyCanvas,
        0, Math.round(srcYPx),
        bodyCanvas.width, Math.round(srcHPx),
        0, 0,
        bodyCanvas.width, Math.round(srcHPx)
      );

      const sliceImgData = sliceCanvas.toDataURL("image/png");
      const sliceH = (sliceCanvas.height / sliceCanvas.width) * contentW;
      pdf.addImage(sliceImgData, "PNG", margin, bodyY, contentW, sliceH);

      // Draw footer
      const footerY = pdfH - footerH;
      pdf.addImage(footerImg, "PNG", margin, footerY, contentW, footerH);

      // Page number
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${page + 1} of ${totalPages}`, pdfW / 2, pdfH - 2, { align: "center" });
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