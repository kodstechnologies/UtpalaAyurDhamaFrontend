import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { getHeader } from "../../../../components/pdf/pdfHeader";
import { getFooter } from "../../../../components/pdf/pdfFooter";

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
    const part = num % 1000;
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
    num = Math.floor(num / 1000);
    i++;
  }
  return str.trim() || "Zero";
};

export const handleDownload = async (id) => {
  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

  try {
    const response = await axios.get(
      getApiUrl(`examinations/user-last-prescription/${id}`),
      { headers: getAuthHeaders() }
    );

    const data = response.data?.data;
    if (!data) {
      toast.error("No prescription data found");
      return;
    }

    // ────────────────────────────────────────────────
    // Patient & basic info
    // ────────────────────────────────────────────────
    const patient = {
      name: data.patientName || "Nagaraj",
      gender: data.gender || "Male",
      age: data.age || "",
      mobile: data.mobile || "",
    };

    const invoice = {
      no: data.invoiceNo || "P-" + (data.uhid || "XXXX"),
      date: data.date || new Date().toLocaleDateString("en-IN"),
      doctor: data.doctorName || "Dr. Nagaraj",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    // ────────────────────────────────────────────────
    // Financials — using ACTUAL fields from your API
    // ────────────────────────────────────────────────
    const subtotal = Number(data.subtotal || 0);
    const gstRate = Number(data.gst || 0);           // e.g. 5
    const gstAmount = Number(data.gstAmount || 0);     // e.g. 90
    const grandTotal = Number(data.totalWithGst || 0);  // e.g. 1890

    const subtotalStr = subtotal.toFixed(2);
    const gstAmountStr = gstAmount.toFixed(2);
    const grandTotalStr = grandTotal.toFixed(2);

    // GST rate display logic (prefer explicit gst field)
    let gstRateText = "";
    if (gstAmount > 0) {
      if (gstRate > 0) {
        gstRateText = `${gstRate}%`;
      } else if (subtotal > 0) {
        // fallback only if gst field missing (very safe rounding)
        const calculatedRate = (gstAmount / subtotal) * 100;
        gstRateText = `${Math.round(calculatedRate * 100) / 100}%`;
      }
    }

    const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;
    const diagnosis = (data.diagnosis || "").trim();
    const paidNum = Number(data.padeamount || 0);
    const balanceDueNum =
      data.balanceDue != null && data.balanceDue !== ""
        ? Number(data.balanceDue)
        : Math.max(0, Math.round((grandTotal - paidNum) * 100) / 100);

    let paymentStatusLabel = data.paymentStatus || "Unpaid";
    if (grandTotal > 0 && balanceDueNum > 0 && paidNum > 0) paymentStatusLabel = "Partially Paid";
    else if (grandTotal > 0 && balanceDueNum <= 0) paymentStatusLabel = "Paid";
    else if (paidNum <= 0) paymentStatusLabel = "Unpaid";

    const statusColor = paymentStatusLabel === "Paid" ? "#2e7d32" : paymentStatusLabel === "Partially Paid" ? "#000000" : "#000000";
    const bgColor = paymentStatusLabel === "Paid" ? "#ffffff" : paymentStatusLabel === "Partially Paid" ? "#8686868a" : "#8686868a";

    const payments = Array.isArray(data.payments) ? data.payments : [];

    // Escape HTML function for safety
    const escapeHtml = (text) => {
      if (!text) return "";
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // ────────────────────────────────────────────────
    // Prepare medicine rows
    // ────────────────────────────────────────────────
    const items = data.medicines || [];
    const medicinesRows = items.map((m, i) => {
      const qty = Number(m.quantity || 1);
      const rate = Number(m.price || m.rate || 0);
      const total = qty * rate;
      return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:5px; font-size:11px;">${escapeHtml(m.medicineName || m.itemName || "")}${m.subType ? ` (${escapeHtml(m.subType)})` : ""}</td>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${qty}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || 1), 0);
    const paymentHistoryRows =
      payments.length > 0
        ? payments
            .map(
              (p, i) => `
        <tr>
          <td style="border:1px solid #b2dfdb; padding:6px 5px; text-align:center;">${i + 1}</td>
          <td style="border:1px solid #b2dfdb; padding:6px 5px; text-align:right; font-weight:600;">₹${Number(p.amount || 0).toFixed(2)}</td>
          <td style="border:1px solid #b2dfdb; padding:6px 5px;">${escapeHtml(String(p.method || "—"))}</td>
          <td style="border:1px solid #b2dfdb; padding:6px 5px; color:#555; font-size:9px;">${escapeHtml(String(p.paidAt || "—"))}</td>
          <td style="border:1px solid #b2dfdb; padding:6px 5px; color:#555; font-size:9px; word-break:break-all;">${escapeHtml(String(p.reference || "—"))}</td>
        </tr>
      `
            )
            .join("")
        : `<tr><td colspan="5" style="text-align:center; padding:12px; color:#777; border:1px dashed #b2dfdb;">No payment entries recorded</td></tr>`;
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
        <!-- Patient + Invoice Info -->
        <div style="display:flex; border:1px solid #000; margin:10px 0; font-size:13px;">
          <div style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000;">
            <table style="width:100%;">
              <tr><td style="font-weight:bold; width:110px;">Patient Name</td><td>:</td><td>${escapeHtml(patient.name)}</td></tr>
              <tr><td style="font-weight:bold;">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
              <tr><td style="font-weight:bold;">Mobile</td><td>:</td><td>${escapeHtml(patient.mobile)}</td></tr>
               <tr><td style="font-weight:bold;">Generated By</td><td>:</td><td>${escapeHtml(receptionistName || "")}</td></tr>
            </table>
          </div>
          <div style="width:35%; background:#f9f5f0; padding:12px;">
            <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
              PRESCRIPTION
            </div>
            <table style="width:100%;">
              <tr><td style="font-weight:bold; width:70px;">No:</td><td>${escapeHtml(invoice.no)}</td></tr>
              <tr><td style="font-weight:bold;">Date /Time:</td><td>${invoice.date} @ ${invoice.time}</td></tr>
             
              <tr><td style="font-weight:bold;">Doctor:</td><td>${escapeHtml(invoice.doctor)}</td></tr>
            </table>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
          <thead>
            <tr style="background:#f5f5f5;">
               <th style="border:1px solid #000; padding:6px; width:45px;">Srl</th>
              <th style="border:1px solid #000; padding:6px;">Medicine Name</th>
              <th style="border:1px solid #000; padding:6px; width:60px;">Qty</th>
              <th style="border:1px solid #000; padding:6px; width:85px;">Rate</th>
              <th style="border:1px solid #000; padding:6px; width:85px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesRows}
          
      
      
          </tbody>
        </table>

        <div style="display:flex; margin-top:15px; padding-top:10px;">
          <div style="width:55%; padding-right:15px;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:6px;">Amount in Words:</div>
            <div style="font-style:italic; font-size:12px;">${escapeHtml(amountInWords)}</div>

            ${payments.length > 0 ? `
              <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
              ${payments.map((p, i) => `
                <div style="font-size:11px; margin-top:4px;">
                  ${i + 1}. ₹${Number(p.amount || 0).toFixed(2)} via ${escapeHtml(String(p.method || "Cash"))} on ${escapeHtml(String(p.paidAt || "N/A"))}
                  ${p.reference ? ` | Ref: ${escapeHtml(String(p.reference))}` : ""}
                </div>
              `).join("")}
            ` : `
              <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
              <div style="font-size:11px; margin-top:4px;">No payment entries recorded</div>
            `}
          </div>

          <div style="width:45%; font-size:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span>Subtotal:</span><span>₹${subtotalStr}</span>
            </div>
            ${Number(gstAmountStr) > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>GST (${gstRateText || "—"}):</span><span>₹${gstAmountStr}</span>
              </div>
            ` : ""}
            <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold; border-top:2px solid #000; padding-top:8px; margin-top:8px;">
              <span>TOTAL PAYABLE:</span><span>₹${grandTotalStr}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; color:#2e7d32;">
              <span>Amount Paid:</span><span>₹${paidNum.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; color:${statusColor}; margin-top:6px;">
              <span>Balance Due:</span><span>₹${balanceDueNum.toFixed(2)}</span>
            </div>
            <div style="margin-top:8px;">
              <span style="background-color:${bgColor}; color:${statusColor}; font-weight:600; font-size:11px; border-radius:4px; display:inline-block; padding:2px 8px;">
                ${escapeHtml(paymentStatusLabel.toUpperCase())}
              </span>
            </div>
          </div>
        </div>
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

    pdf.save(`Prescription_${invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
    toast.success("Prescription downloaded successfully");

  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate prescription PDF");
  }
};