import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { pdfPrHeader } from "../../../../components/pdf/pdfPrHeader";
import { getFooter } from "../../../../components/pdf/pdfFooter";
import { buildInvoiceSummarySectionHtml } from "./invoiceSummarySectionHtml";
import { buildInvoiceCategoryBlockHtmls } from "./invoiceCategoryBlockHtml";
import { layoutPdfSections, trimCanvasBottomWhitespace } from "./invoicePdfLayout";
import { getNotesSection } from "../../../../components/pdf/note";

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

/**
 * Print invoice as PDF — design matched to invoiceHandleDownload
 */
const invoiceHandlePrint = async (invoice, options = {}) => {

  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

  if (!invoice) {
    toast.error("No invoice data available");
    return;
  }

  const paymentIndex = options.paymentIndex;
  const selectedPayment =
    paymentIndex != null && invoice.payments?.[paymentIndex]
      ? invoice.payments[paymentIndex]
      : null;
  const isSinglePaymentReceipt = selectedPayment != null;

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

    const categoryBlockHtmls = buildInvoiceCategoryBlockHtmls(invoice, formatCurrency, {
      isPaymentReceipt: isSinglePaymentReceipt,
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
    const receiptAmount = Number(selectedPayment?.amount || 0);
    // For per-payment receipts, show a running balance: opening balance before
    // this payment = total payable minus everything paid in earlier receipts.
    const previousPaid = isSinglePaymentReceipt
      ? (invoice.payments || [])
          .slice(0, paymentIndex)
          .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      : 0;
    const openingBalance = totalPayable - previousPaid;
    const displaySubtotal = isSinglePaymentReceipt ? receiptAmount : subtotal;
    const displayAmountPaid = isSinglePaymentReceipt ? receiptAmount : amountPaid;
    const paymentsForHistory = isSinglePaymentReceipt
      ? [selectedPayment]
      : (invoice.payments || []);
    const subtotalBoxLabel = isSinglePaymentReceipt ? "AMOUNT RECEIVED" : "SUBTOTAL";

    const paymentStatus = amountPaid >= totalPayable ? "PAID" : amountPaid > 0 ? "PARTIALLY PAID" : "UNPAID";
    // const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#f57c00" : "#d32f2f";
    const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#000000ff" : "#000000ff";
    const bgColor = amountPaid >= totalPayable ? "#ffffffff" : amountPaid > 0 ? "#8686868a" : "#8686868a";


    const amountInWords = isSinglePaymentReceipt
      ? `Rupees ${numberToWords(Math.round(receiptAmount))} Only`
      : `Rupees ${numberToWords(Math.round(totalPayable))} Only`;

    const receiptPanelTitle = "RECEIPT / INVOICE DETAILS";

    const receiptDateTime = selectedPayment
      ? `${formatDate(selectedPayment.date)} @ ${new Date(selectedPayment.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
      : `${invoiceDate} @ ${new Date(invoice.createdAt || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const receiptDetailsRows = `
              <tr>
                <td style="font-weight:bold; width:45%; padding:6px 0;">Invoice No</td>
                <td style="padding:6px 0;">: ${escapeHtml(invoiceNo)}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; padding:6px 0;">Date / Time</td>
                <td style="padding:6px 0;">: ${escapeHtml(receiptDateTime)}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; padding:6px 0; vertical-align:middle;">Status</td>
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
                <td style="font-weight:bold; padding:6px 0;">Type</td>
                <td style="padding:6px 0;">: ${invoice.inpatient ? "IN-PATIENT" : invoice.examination?.isDaycare ? "DAYCARE" : "OUT-PATIENT"}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; padding:0 0 12px 0;">Generated By</td>
                <td style="padding:0 0 12px 0;">: ${escapeHtml(receptionistName || "N/A")}</td>
              </tr>
      `;

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
      const captureHeight = el.scrollHeight + 16;
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: width,
        windowHeight: captureHeight,
        height: captureHeight,
      });
      document.body.removeChild(el);
      return canvas;
    };

    // ── Render header, brown footer (all pages), notes (last page), and body sections ──
    const headerHtml = `<div style="width:794px; box-sizing:border-box; ">${pdfPrHeader()}</div>`;
    const brownFooterHtml = `<div style="width:794px; box-sizing:border-box;">${getFooter()}</div>`;

    const infoSectionHtml = `
      <div style="width:794px; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">
        <div style="display:flex; border:1px solid #000; margin:10px 0; height:100%">
          <div style="width:60%; border-right:1px solid #000;">
            <div style="text-align:center; font-weight:bold; font-size:16px; border-bottom:1px solid #000; padding: 0 0 15px 0; background:#f5f0eb;">
              PATIENT DETAILS
            </div>
            <div style="background:#fafafa; padding:12px;">
            <table style="width:100%; font-size:12px;">
              <tr><td style="font-weight:bold; width:100px;">NAME</td><td>:</td><td>${escapeHtml(patient.name)}</td></tr>
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
          </div>
          <div style="width:40%;">
            <div style="text-align:center; font-weight:bold; font-size:16px; border-bottom:1px solid #000; padding: 0 0 15px 0; background:#f5f0eb;">
              ${receiptPanelTitle}
            </div>
            <div style="background:#fafafa; padding:12px;">
            <table style="width:100%; font-size:12px; border-collapse:collapse;">
              ${receiptDetailsRows}
            </table>
            </div>
          </div>
        </div>
      </div>
    `;

    const summaryParams = {
      subtotalBoxLabel,
      displaySubtotal,
      amountInWords,
      paymentsForHistory,
      formatCurrency,
      formatDate,
      isSinglePaymentReceipt,
      receiptAmount,
      subtotal,
      taxAmount,
      invoice,
      discountAmount,
      discountText,
      totalPayable,
      displayAmountPaid,
      balanceDue,
      previousPaid,
      openingBalance,
    };
    const summarySectionHtml = buildInvoiceSummarySectionHtml(summaryParams);
    const notesSectionHtml = `<div style="width:794px; box-sizing:border-box; padding:0 15px;">${getNotesSection()}</div>`;

    // Render static header/footer + each printable section separately.
    // This allows us to avoid splitting a section (especially item tables) across pages.
    const [headerCanvas, brownFooterCanvas, infoCanvas, summaryCanvas, notesCanvasRaw] = await Promise.all([
      renderToCanvas(headerHtml),
      renderToCanvas(brownFooterHtml),
      renderToCanvas(infoSectionHtml),
      renderToCanvas(summarySectionHtml),
      renderToCanvas(notesSectionHtml),
    ]);
    const notesCanvas = trimCanvasBottomWhitespace(notesCanvasRaw);
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
    const brownFooterH = pxToMm(brownFooterCanvas);
    const topPad = 0;
    const botPad = 2;
    const bodyAreaH = pdfH - headerH - brownFooterH - topPad - botPad;

    const headerImg = headerCanvas.toDataURL("image/png");
    const brownFooterImg = brownFooterCanvas.toDataURL("image/png");
    const sections = [infoCanvas, ...categoryCanvases, summaryCanvas, notesCanvas];

    const notesSectionH = pxToMm(notesCanvas);

    const drawPageChrome = () => {
      pdf.addImage(headerImg, "PNG", margin, 0, contentW, headerH);
    };

    const drawBrownFooter = () => {
      const footerY = pdfH - brownFooterH - 6;
      pdf.addImage(brownFooterImg, "PNG", margin, footerY, contentW, brownFooterH);
    };

    layoutPdfSections({
      pdf,
      sections,
      pxToMm,
      bodyAreaH,
      headerH,
      topPad,
      brownFooterH,
      notesSectionH,
      pdfH,
      pdfW,
      margin,
      contentW,
      drawPageChrome,
      drawBrownFooter,
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
