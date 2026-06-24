import { buildInvoiceNoRowHtml, escapeHtml, shouldShowInvoiceNo } from "./outsideDispensePdfUtils";

const numberToWordsIndian = (num) => {
    if (num === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
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

            if (hundreds > 0) partStr += `${ones[hundreds]} Hundred `;
            if (remainder > 0) {
                if (remainder < 20) partStr += ones[remainder];
                else {
                    partStr += tens[Math.floor(remainder / 10)];
                    if (remainder % 10) partStr += ` ${ones[remainder % 10]}`;
                }
            }
            str = `${partStr.trim()}${scales[i] ? ` ${scales[i]}` : ""}${str ? ` ${str}` : ""}`;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return str.trim() || "Zero";
};

const pickAmount = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === "") continue;
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
};

export const buildPrescriptionDocumentData = (apiData, billingSnapshot = {}, receptionistName = "") => {
    const data = apiData || {};

    const patient = {
        name: data.patientName || "",
        gender: data.gender || "",
        age: data.age ?? "",
        mobile: data.mobile || "",
    };

    const invoice = {
        no: data.invoiceNo || billingSnapshot.invoiceNo || "",
        date: data.date
            ? data.date
            : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
        doctor: data.doctorName || "",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };

    const showInvoiceNo = shouldShowInvoiceNo({
        patientCategory: billingSnapshot.patientCategory,
        admissionStatus: data.admissionStatus || billingSnapshot.admissionStatus,
        recordType: billingSnapshot.recordType || data.recordType,
    });

    const subtotalNum = Number(billingSnapshot.subtotal ?? data.subtotal ?? 0);
    const gstRateNum = Number(billingSnapshot.gst ?? data.gst ?? 0);
    const gstAmountNum = Number(billingSnapshot.gstAmount ?? data.gstAmount ?? 0);
    const estimatedTotalNum = subtotalNum + gstAmountNum;
    const totalWithGstNum =
        Number(billingSnapshot.totalWithGst ?? data.totalWithGst ?? 0) > 0
            ? Number(billingSnapshot.totalWithGst ?? data.totalWithGst)
            : estimatedTotalNum;

    let gstRateText = `${gstRateNum}%`;
    if (gstRateNum === 0 && gstAmountNum > 0 && subtotalNum > 0) {
        gstRateText = `${Math.round((gstAmountNum / subtotalNum) * 100)}%`;
    }

    const payments = Array.isArray(data.payments) ? data.payments : [];
    const sumOfPayments = payments.reduce((sum, p) => sum + Number(p?.amount || 0), 0);
    const paidNum = pickAmount(
        billingSnapshot.totalPaid,
        billingSnapshot.paidAmount,
        billingSnapshot.amountPaid,
        billingSnapshot.padeamount,
        data.totalPaid,
        data.paidAmount,
        data.amountPaid,
        data.padeamount,
        sumOfPayments
    );
    const balanceDueNum =
        billingSnapshot.balanceDue != null && billingSnapshot.balanceDue !== ""
            ? pickAmount(billingSnapshot.balanceDue)
            : data.balanceDue != null && data.balanceDue !== ""
                ? pickAmount(data.balanceDue)
                : Math.max(0, Math.round((totalWithGstNum - paidNum) * 100) / 100);

    let paymentStatusLabel = billingSnapshot.paymentStatus || data.paymentStatus || "Unpaid";
    if (totalWithGstNum > 0 && balanceDueNum > 0 && paidNum > 0) paymentStatusLabel = "Partially Paid";
    else if (totalWithGstNum > 0 && balanceDueNum <= 0) paymentStatusLabel = "Paid";
    else if (paidNum <= 0) paymentStatusLabel = "Unpaid";

    const items = (data.medicines || []).map((m) => {
        const qty = Number(m.quantity || 1);
        const rate = Number(m.price || m.rate || 0);
        const total = Number(m.total) > 0 ? Number(m.total) : qty * rate;
        return {
            medicineName: m.medicineName || m.itemName || "",
            subType: m.subType || "",
            qty,
            rate,
            total,
        };
    });

    return {
        patient,
        invoice,
        showInvoiceNo,
        generatedBy: receptionistName || "",
        subtotal: subtotalNum.toFixed(2),
        gstRateText,
        gstAmount: gstAmountNum.toFixed(2),
        totalWithGst: totalWithGstNum.toFixed(2),
        paidNum,
        balanceDueNum,
        paymentStatusLabel,
        amountInWords: `Rupees ${numberToWordsIndian(totalWithGstNum)} Only`,
        payments,
        items,
    };
};

const buildMedicineRowsHtml = (items, variant = "print") => {
    const cellStyle =
        variant === "pdf"
            ? "border:1px solid #000; padding:5px; font-size:11px;"
            : "border:1px solid #000; padding:5px; font-size:11px;";

    return items
        .map((m, i) => {
            const label = m.subType ? `${m.medicineName} (${m.subType})` : m.medicineName;
            return `
        <tr>
          <td style="text-align:center; ${cellStyle}">${i + 1}</td>
          <td style="${cellStyle}">${escapeHtml(label)}</td>
          <td style="text-align:center; ${cellStyle}">${m.qty}</td>
          <td style="text-align:right; ${cellStyle}">${m.rate.toFixed(2)}</td>
          <td style="text-align:right; ${cellStyle}">${m.total.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("");
};

const buildPaymentHistoryHtml = (payments) => {
    if (payments.length > 0) {
        return `
      <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
      ${payments
          .map(
              (p, i) => `
        <div style="font-size:11px; margin-top:4px;">
          ${i + 1}. ₹${Number(p.amount || 0).toFixed(2)} via ${escapeHtml(String(p.method || "Cash"))} on ${escapeHtml(String(p.paidAt || "N/A"))}
          ${p.reference ? ` | Ref: ${escapeHtml(String(p.reference))}` : ""}
        </div>
      `
          )
          .join("")}
    `;
    }
    return `
    <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
    <div style="font-size:11px; margin-top:4px;">No payment history available.</div>
  `;
};

const buildTotalsHtml = (doc) => {
    const { subtotal, gstRateText, gstAmount, totalWithGst, paidNum, balanceDueNum, paymentStatusLabel } = doc;
    const statusColor =
        paymentStatusLabel === "Paid" ? "#2e7d32" : paymentStatusLabel === "Partially Paid" ? "#000000" : "#000000";

    const row = (label, value, style = "") =>
        `<tr><td style="padding:3px 0; text-align:left; ${style}">${label}</td><td style="padding:3px 0; text-align:right; white-space:nowrap; font-weight:600; ${style}">${value}</td></tr>`;

    return `
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      ${row("Subtotal:", `₹${subtotal}`)}
      ${row(`GST (${gstRateText}):`, `₹${gstAmount}`)}
      <tr>
        <td style="padding:8px 0 3px; font-size:14px; font-weight:bold; border-top:2px solid #000;">TOTAL PAYABLE:</td>
        <td style="padding:8px 0 3px; font-size:14px; font-weight:bold; text-align:right; border-top:2px solid #000;">₹${totalWithGst}</td>
      </tr>
      ${paidNum > 0 ? row("Total Paid:", `₹${paidNum.toFixed(2)}`, "color:#2e7d32;") : ""}
      ${balanceDueNum > 0 ? row("Balance Due:", `₹${balanceDueNum.toFixed(2)}`, `font-weight:bold; font-size:13px; color:${statusColor};`) : ""}
    </table>
  `;
};

export const buildPrescriptionBodyHtml = (doc, variant = "print") => {
    const { patient, invoice, showInvoiceNo, generatedBy, amountInWords, payments, items, paymentStatusLabel } = doc;
    const invoiceNoRowHtml = buildInvoiceNoRowHtml(invoice.no, showInvoiceNo, variant === "pdf" ? "pdf" : "print");
    const medicinesRows = buildMedicineRowsHtml(items, variant);
    const paymentHistoryHtml = buildPaymentHistoryHtml(payments);
    const totalsHtml = buildTotalsHtml(doc);

    const statusBg =
        paymentStatusLabel === "Paid" ? "#ffffff" : paymentStatusLabel === "Partially Paid" ? "#f5f5f5" : "#f5f5f5";

    const labelCell = "font-weight:bold; width:110px; padding:4px 0; vertical-align:top; white-space:nowrap;";
    const colonCell = "width:10px; padding:4px 0; vertical-align:top;";
    const valueCell = "padding:4px 0; vertical-align:top;";

    return `
    <div style="width:100%; box-sizing:border-box; padding:0 15px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff; font-size:13px;">
      <table style="width:100%; border:1px solid #000; border-collapse:collapse; margin:10px 0; table-layout:fixed;">
        <tr>
          <td style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000; vertical-align:top;">
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="${labelCell}">Patient Name</td><td style="${colonCell}">:</td><td style="${valueCell}">${escapeHtml(patient.name)}</td></tr>
              <tr><td style="${labelCell}">Age / Gender</td><td style="${colonCell}">:</td><td style="${valueCell}">${patient.age !== "" && patient.age != null ? `${patient.age} / ` : ""}${escapeHtml(patient.gender)}</td></tr>
              <tr><td style="${labelCell}">Mobile No</td><td style="${colonCell}">:</td><td style="${valueCell}">${escapeHtml(patient.mobile)}</td></tr>
              <tr><td style="${labelCell}">Generated By</td><td style="${colonCell}">:</td><td style="${valueCell}">${escapeHtml(generatedBy)}</td></tr>
            </table>
          </td>
          <td style="width:35%; background:#f9f5f0; padding:12px; vertical-align:top;">
            <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
              PRESCRIPTION
            </div>
            <table style="width:100%; border-collapse:collapse;">
              ${invoiceNoRowHtml}
              <tr><td style="${labelCell}">Date / Time</td><td style="${colonCell}">:</td><td style="${valueCell}; white-space:nowrap;">${invoice.date} @ ${invoice.time}</td></tr>
              <tr><td style="${labelCell}">Doctor</td><td style="${colonCell}">:</td><td style="${valueCell}">${escapeHtml(invoice.doctor)}</td></tr>
              <tr>
                <td style="${labelCell}">Payment Status</td>
                <td style="${colonCell}">:</td>
                <td style="${valueCell}">
                  <span style=" background-color:${statusBg}; color:#000; font-size:12px; font-weight:700; border-radius:4px; display:inline-block; padding:2px 8px;">
                    ${escapeHtml(paymentStatusLabel)}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">Sl</th>
            <th style="border:1px solid #000; padding:6px; text-align:center;">Medicine Name</th>
            <th style="border:1px solid #000; padding:6px; width:60px; text-align:center;">Qty</th>
            <th style="border:1px solid #000; padding:6px; width:85px; text-align:center;">Rate (₹)</th>
            <th style="border:1px solid #000; padding:6px; width:85px; text-align:center;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>${medicinesRows}</tbody>
      </table>

      <table style="width:100%; border-collapse:collapse; margin-top:15px; margin-bottom:10px;">
        <tr>
          <td style="width:55%; vertical-align:top; padding-right:15px;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:6px;">Amount in Words:</div>
            <div style="font-style:italic; font-size:12px;">${escapeHtml(amountInWords)}</div>
            ${paymentHistoryHtml}
          </td>
          <td style="width:45%; vertical-align:top; font-size:12px;">
            ${totalsHtml}
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const buildPrescriptionPrintHtml = (headerHtml, bodyHtml, footerHtml) => `
<!DOCTYPE html>
<html>
<head>
  <title>Prescription - Utpala Ayurdhama</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .report-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 50rem;
      width: 100%;
      margin: 0 auto;
      background: white;
      z-index: 10;
    }
    .footer-spacer { height: 180px; }
    .label { font-weight: bold; }
    @media print {
      body { border: none; margin: 0; width: 100%; max-width: none; }
      .report-header { display: table-header-group; }
      .report-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 100%;
        width: 100%;
        margin: 0 auto;
      }
    }
  </style>
</head>
<body>
  <table class="report-container">
    <thead>
      <tr><td class="report-header">${headerHtml}</td></tr>
    </thead>
    <tbody>
      <tr><td>${bodyHtml}</td></tr>
    </tbody>
    <tfoot>
      <tr><td><div class="footer-spacer"></div></td></tr>
    </tfoot>
  </table>
  <div class="report-footer">${footerHtml}</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
      window.onafterprint = function() {
        setTimeout(function() {
          if (window.opener && !window.opener.closed) window.close();
        }, 1000);
      };
    };
  </script>
</body>
</html>
`;
