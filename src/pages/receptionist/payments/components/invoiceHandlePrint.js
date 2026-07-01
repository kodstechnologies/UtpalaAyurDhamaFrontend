import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { pdfPrHeader } from "../../../../components/pdf/pdfPrHeader";
import { getNote } from "../../../../components/pdf/note";

// ── Reused helpers (same as in download version) ──
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

const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString("en-IN");
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const pickPatientUhid = (...values) => {
  for (const value of values) {
    if (value && value !== "N/A" && String(value).trim().startsWith("UA")) {
      return String(value).trim();
    }
  }
  return "N/A";
};

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
 * Print invoice as PDF — design matched to invoiceHandleDownload
 */
const invoiceHandlePrint = async (invoice) => {

  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

  if (!invoice) {
    toast.error("No invoice data available");
    return;
  }

  try {
    const patient = {
      name: invoice.patient?.user?.name || invoice.patient?.name || invoice.patientName || "N/A",
      gender:
        invoice.patient?.user?.gender ||
        invoice.patient?.gender ||
        invoice.examination?.patient?.user?.gender ||
        invoice.examination?.patient?.gender ||
        invoice.inpatient?.patient?.user?.gender ||
        invoice.inpatient?.patient?.gender ||
        invoice.gender ||
        "N/A",
      age:
        invoice.patient?.age ??
        invoice.examination?.patient?.age ??
        invoice.inpatient?.patient?.age ??
        invoice.age ??
        "N/A",
      ageUnit:
        invoice.patient?.ageUnit ||
        invoice.examination?.patient?.ageUnit ||
        invoice.inpatient?.patient?.ageUnit ||
        invoice.ageUnit ||
        "years",
      phone: invoice.patient?.user?.phone || "N/A",
      alternativeNumber: invoice.patient?.alternativeNumber || "",
      email: invoice.patient?.user?.email || "_",
      uhid: pickPatientUhid(
        invoice.patient?.user?.uhid,
        invoice.patient?.uhid,
        invoice.examination?.patient?.user?.uhid,
        invoice.examination?.patient?.uhid,
        invoice.inpatient?.patient?.user?.uhid,
        invoice.inpatient?.patient?.uhid,
        invoice.uhid,
      ),
      patientId:
        invoice.patient?.patientId ||
        invoice.examination?.patient?.patientId ||
        invoice.inpatient?.patient?.patientId ||
        invoice.patientId ||
        "N/A",
      address: invoice.patient?.address || invoice.patient?.user?.address || "N/A",
    };

    const formattedAge = patient.age === "N/A"
      ? "N/A"
      : `${patient.age} ${String(patient.ageUnit).toLowerCase().startsWith("month") ? "m" : "y"}`;

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

    let counter = 0;
    const categoryBlockHtmls = [];

    categoryOrder.forEach((cat) => {
      const catItems = grouped[cat];
      if (!catItems || catItems.length === 0) return;

      const catTotal = catItems.reduce((sum, i) => sum + (i.total || i.amount || 0), 0);

      const isTherapy = cat === "Therapy";
      const isConsultation = cat === "Doctor Consultation";
      const isBedCharges = cat === "Bed Charges";

      // Skip rendering "Doctor Consultation" if its total is 0
      if (isConsultation && catTotal === 0) return;

      let blockHtml = `
        <div class="category-block-title" style="margin-top:15px; background:#f5f5f5; padding:0 0 16px 16px; border:1px solid #000; font-weight:bold;  ">
          <span>${cat}</span>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:11px; border-top:none;">
          <thead>
            <tr>
              <th style="border-left:1px solid #000; border-bottom:1px solid #000; border-right:1px solid #000; border-top:none; padding:0 0 12px 0; text-align:center; width:40px;">Sno</th>
              <th style="border-right:1px solid #000; border-bottom:1px solid #000; border-top:none; text-align:center; padding:0 0 12px 0;">${isTherapy ? "Therapy Name" : "Service Name"}</th>
              ${isConsultation ? '<th style="border-right:1px solid #000; border-bottom:1px solid #000; border-top:none; padding:0 0 12px 0; text-align:center;">Doctor Name</th>' : !isBedCharges ? '<th style="border:1px solid #000; border-top:none; padding:0 0 12px 0; text-align:center;">Description</th>' : ''}
              ${isTherapy ? '<th style="border-right:1px solid #000; border-bottom:1px solid #000; border-top:none; padding:0 0 12px 0; width:60px; text-align:center;">Session</th>' : ''}
              <th style="border-right:1px solid #000; border-bottom:1px solid #000; text-align:center; border-top:none; padding:0 0 12px 0;  width:90px;">Unit Price</th>
              <th style="border-right:1px solid #000; border-bottom:1px solid #000; text-align:center; border-top:none; padding:0 0 12px 0;  width:90px;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      catItems.forEach((item) => {
        counter++;
        const qty = item.dispensedQuantity || item.quantity || 1;
        const unitPrice = item.unitPrice || item.amount || 0;
        const total = item.total || item.amount || 0;

        blockHtml += `
          <tr>
            <td style="border-left:1px solid #000; border-bottom:1px solid #000; border-right:1px solid #000; border-top:none; padding: 0 0 12px 0; text-align:center; font-size:11px;">${counter}</td>
            <td style="border-bottom:1px solid #000; border-right: 1px solid #000; padding: 0 0 12px 0; text-align:center; font-size:11px;">
              ${escapeHtml(item.name || "Item")}
              ${item.subTherapy ? `<div style="font-size:10px; color:#666; text-align:center; font-style:italic; margin-top:2px;">Sub-Therapy: ${escapeHtml(item.subTherapy)}</div>` : ""}
              ${item.remarks ? `<div style="font-size:10px; color:#666; font-style:italic; margin-top:2px;">Remarks: ${escapeHtml(item.remarks)}</div>` : ""}
            </td>
            ${!isBedCharges ? `
              <td style="border-bottom:1px solid #000; border-right: 1px solid #000; padding: 0 0 12px 0; text-align:center; font-size:11px;">
                ${isConsultation ? ((item.total || item.amount || 0) > 0 ? (item.doctorName || invoice.doctor?.user?.name || "") : "") : (item.description ? escapeHtml(item.description).replace(/\\n/g, "<br>") : "—")}
              </td>
            ` : ""}
            ${isTherapy ? `<td style="border-bottom:1px solid #000; border-right: 1px solid #000; padding: 0 0 12px 0; text-align:center; font-size:11px;">${qty}</td>` : ''}
            <td style="border-bottom:1px solid #000; border-right: 1px solid #000; padding: 0 0 12px 0; text-align:center; font-size:11px;">₹${formatCurrency(unitPrice)}</td>
            <td style="border-bottom:1px solid #000; border-right: 1px solid #000; border-right: 1px solid #000; padding: 0 0 12px 0; text-align:center; font-size:11px;">₹${formatCurrency(total)}</td>
          </tr>
        `;
      });

      blockHtml += `
          </tbody>
        </table>
      `;
      categoryBlockHtmls.push(blockHtml);
    });

    const subtotal = invoice.subtotal || 0;

    // Calculate Tax and Discount correctly
    const pharmacySubtotal = (invoice.items || [])
      .filter(item => item.category?.toLowerCase() === "pharmacy")
      .reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (pharmacySubtotal * (invoice.taxRate || 0)) / 100;
    const grandTotal = subtotal + taxAmount;
    const discountAmount = Math.max(0, grandTotal - (invoice.totalPayable || 0));

    const discountText = invoice.discountType === "percentage"
      ? `Discount (${invoice.discountRate || 0}%)`
      : discountAmount > 0 ? "Discount (Amount)" : "";

    const totalPayable = invoice.totalPayable || 0;
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = totalPayable - amountPaid;

    const paymentStatus = amountPaid >= totalPayable ? "PAID" : amountPaid > 0 ? "PARTIALLY PAID" : "UNPAID";
    // const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#f57c00" : "#d32f2f";
    const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#000000ff" : "#000000ff";
    const bgColor = amountPaid >= totalPayable ? "#ffffffff" : amountPaid > 0 ? "#8686868a" : "#8686868a";


    const amountInWords = `Rupees ${numberToWords(Math.round(totalPayable))} Only`;

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
      // Let the browser load fonts / icons
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
    const headerHtml = `<div style="width:794px; box-sizing:border-box; ">${pdfPrHeader()}</div>`;
    const footerHtml = `<div style="width:794px; box-sizing:border-box; margin-bottom: 45px; ">${getNote()}</div>`;

    const infoSectionHtml = `
      <div style="width:794px; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">
        <div style="display:flex; border:1px solid #000; margin:10px 0; height:100%">
          <div style="width:60%; background:#fafafa; padding:12px; border-right:1px solid #000;">
            <table style="width:100%; font-size:12px;">
              <tr><td style="font-weight:bold; width:100px;">PATIENT</td><td>:</td><td>${escapeHtml(patient.name)}</td></tr>
              <tr><td style="font-weight:bold;">AGE</td><td>:</td><td>${escapeHtml(formattedAge)}</td></tr>
              <tr><td style="font-weight:bold;">GENDER</td><td>:</td><td>${escapeHtml(patient.gender)}</td></tr>
              ${patient.address && patient.address !== "N/A" ? `<tr><td style="font-weight:bold;">ADDRESS</td><td>:</td><td>${escapeHtml(patient.address)}</td></tr>` : ""}
              ${patient.phone && patient.phone !== "N/A" ? `<tr><td style="font-weight:bold;">PHONE</td><td>:</td><td>${escapeHtml(patient.phone)}</td></tr>` : ""}
              ${patient.alternativeNumber ? `<tr><td style="font-weight:bold;">ALT. NO</td><td>:</td><td>${escapeHtml(patient.alternativeNumber)}</td></tr>` : ""}
              <tr><td style="font-weight:bold;">UHID NO</td><td>:</td><td>${escapeHtml(patient.uhid)}</td></tr>
              <tr><td style="font-weight:bold;">PATIENT ID</td><td>:</td><td>${escapeHtml(patient.patientId)}</td></tr>
              <tr><td style="font-weight:bold;">E-MAIL</td><td>:</td><td>${escapeHtml(patient.email || "_")}</td></tr>
             ${doctorName !== "N/A"
        ? `<tr>
       <td style="font-weight:bold;">DOCTOR</td>
       <td>:</td>
       <td>${escapeHtml(
          doctorName.replace(/\bProfile\b/g, "").trim()
        )}</td>
     </tr>`
        : ""}
              ${invoice.referredBy ? `<tr><td style="font-weight:bold; width:100px;">Referred By</td><td>:</td><td>${escapeHtml(invoice.referredBy)}</td></tr>` : ""}
              ${invoice.consultedBy ? `<tr><td style="font-weight:bold; width:100px;">Consulted By</td><td>:</td><td>${escapeHtml(invoice.consultedBy)}</td></tr>` : ""}
            </table>
          </div>
          <div style="width:40%;">
            <div style="text-align:center; font-weight:bold; font-size:16px; border-bottom:1px solid #000; padding: 0 0 15px 0; background:#f5f0eb; ">
              RECEIPT / INVOICE DETAILS
            </div>
            <table style="width:100%; font-size:12px; border-collapse:collapse; margin-top:5px; margin-left:5px;">
              <tr>
                <td style="font-weight:bold; width:45%; padding:6px 0;">Invoice No</td>
                <td style="padding:6px 0;">: ${escapeHtml(invoiceNo)}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; padding:6px 0;">Date /Time</td>
                <td style="padding:6px 0;">: ${invoiceDate} @ ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            <tr>
  <td style="font-weight:bold; padding:6px 0; vertical-align:middle;">
    Status
  </td>
  <td style="vertical-align:middle;">
    <span style="
      background-color:${bgColor};
      color:${statusColor};
      font-weight:600;
      font-size:11px;
      border-radius:4px;
      display:inline-block;
      padding: 0px 5px 12px;
    ">
      ${paymentStatus}
    </span>
  </td>
</tr>
<tr>
              <tr>
                <td style="font-weight:bold; padding:6px 0;">Type</td>
                <td style="padding:6px 0;">: ${invoice.inpatient ? "IN-PATIENT" : invoice.examination?.isDaycare ? "DAYCARE" : "OUT-PATIENT"}</td>
              </tr>
              <tr ">
                <td style="font-weight:bold; padding:0 0 12px 0;">Generated By</td>
                <td style="padding:0 0 12px 0;">: ${escapeHtml(receptionistName || "N/A")}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `;

    const summarySectionHtml = `
      <div style="width:794px; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">
        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <table style="width:50%; border-collapse:collapse; border:1px solid #000;">
            <tr style="font-weight:bold;">
              <td style="padding:0 0 14px 10px; border-right:1px solid #000;">SUBTOTAL</td>
              <td style="padding:0 10px 14px 0; text-align:right;">₹${formatCurrency(subtotal)}</td>
            </tr>
          </table>
        </div>

        <div style="display:flex; margin-top:15px; padding-top:10px;">
          <div style="width:55%; padding-right:15px;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:6px;">Amount in Words:</div>
            <div style="font-style:italic; font-size:12px;">${amountInWords}</div>
            ${invoice.payments?.length > 0 ? `
              <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
              ${invoice.payments.map((p, i) => `
                <div style="font-size:11px; margin-top:4px;">
                  ${i + 1}. ₹${formatCurrency(p.amount)} via ${p.paymentMethod === "Online" ? "UPI" : (p.paymentMethod || "Cash")} on ${formatDate(p.date)}
                  ${p.transactionId ? ` | ID: ${p.transactionId}` : ""}
                  ${p.cardLastFourDigits ? ` | Card: •••• ${p.cardLastFourDigits}` : ""}
                </div>
              `).join("")}
            ` : ""}
          </div>

          <div style="width:45%; font-size:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span>Subtotal:</span><span>₹${formatCurrency(subtotal)}</span>
            </div>
            ${taxAmount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>Tax (${invoice.taxRate}%):</span><span>₹${formatCurrency(taxAmount)}</span>
              </div>
            ` : ""}
            ${discountAmount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#2e7d32;">
                <span>${discountText}:</span><span>-₹${formatCurrency(discountAmount)}</span>
              </div>
            ` : ""}
            <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold; border-top:2px solid #000; padding-top:8px; margin-top:8px;">
              <span>TOTAL PAYABLE:</span><span>₹${formatCurrency(totalPayable)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; color:#2e7d32;">
              <span>Amount Paid:</span><span>₹${formatCurrency(amountPaid)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; margin-bottom:20px; color:${statusColor}; margin-top:6px;">
              <span>Balance Due:</span><span>₹${formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render static header/footer + each printable section separately.
    // This allows us to avoid splitting a section (especially item tables) across pages.
    const [headerCanvas, footerCanvas, infoCanvas, summaryCanvas] = await Promise.all([
      renderToCanvas(headerHtml),
      renderToCanvas(footerHtml),
      renderToCanvas(infoSectionHtml),
      renderToCanvas(summarySectionHtml),
    ]);
    const categoryCanvases = await Promise.all(
      categoryBlockHtmls.map((blockHtml) =>
        renderToCanvas(
          `<div style="width:794px; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">${blockHtml}</div>`
        )
      )
    );

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pdfW - margin * 2;

    const pxToMm = (canvas) => (canvas.height / canvas.width) * contentW;
    const headerH = pxToMm(headerCanvas);
    const footerH = pxToMm(footerCanvas);
    const topPad = 0;
    const botPad = 0;
    const bodyAreaH = pdfH - headerH - footerH - topPad - botPad;

    const headerImg = headerCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");
    const sections = [infoCanvas, ...categoryCanvases, summaryCanvas];

    const totalPagesEstimate = (() => {
      let pages = 1;
      let usedH = 0;
      sections.forEach((canvas) => {
        const sectionH = pxToMm(canvas);
        if (usedH > 0 && usedH + sectionH > bodyAreaH) {
          pages += 1;
          usedH = 0;
        }
        usedH += sectionH;
      });
      return pages;
    })();

    let currentPage = 1;
    let cursorY = headerH + topPad;
    let usedBodyH = 0;

    const drawPageChrome = () => {
      pdf.addImage(headerImg, "PNG", margin, 0, contentW, headerH);
      const footerY = pdfH - footerH;
      pdf.addImage(footerImg, "PNG", margin, footerY, contentW, footerH);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${currentPage} of ${totalPagesEstimate}`, pdfW / 2, pdfH - 5, { align: "center" });
    };

    drawPageChrome();

    sections.forEach((canvas, idx) => {
      const sectionH = pxToMm(canvas);
      const sectionImg = canvas.toDataURL("image/png");

      const requiresNewPage = usedBodyH > 0 && usedBodyH + sectionH > bodyAreaH;
      if (requiresNewPage) {
        pdf.addPage();
        currentPage += 1;
        cursorY = headerH + topPad;
        usedBodyH = 0;
        drawPageChrome();
      }

      // If a single section itself is taller than available page body, render it scaled to fit.
      const renderH = sectionH > bodyAreaH ? bodyAreaH : sectionH;
      pdf.addImage(sectionImg, "PNG", margin, cursorY, contentW, renderH);

      cursorY += renderH;
      usedBodyH += renderH;

      if (idx !== sections.length - 1) {
        cursorY += 1.5;
        usedBodyH += 1.5;
      }
    });

    // ── TRIGGER PRINT ──
    // Use autoPrint to ensure the PDF itself requests a print dialog
    pdf.autoPrint({ variant: 'non-conform' });

    const blob = pdf.output("blob");
    const blobURL = URL.createObjectURL(blob);

    // Technique 1: Hidden Iframe (Most seamless if it works)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.src = blobURL;
    document.body.appendChild(iframe);

    // Return a promise that resolves when the print dialog is triggered or after a safety timeout
    await new Promise((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.warn("Iframe print failed, falling back to new window", e);
          window.open(blobURL, "_blank");
        }
        // Give the browser some time to pop up the dialog before enabling the button again
        setTimeout(finish, 2000);
      };

      // Safety timeout after 10 seconds if nothing happens
      setTimeout(finish, 10000);
    });

    toast.success("Print dialog requested");

  } catch (err) {
    console.error("Print generation error:", err);
    toast.error("Failed to generate print layout");
  }
};

export { invoiceHandlePrint };
export default invoiceHandlePrint;
