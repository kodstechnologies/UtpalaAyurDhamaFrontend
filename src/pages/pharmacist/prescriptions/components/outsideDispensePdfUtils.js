const numberToWords = (num) => {
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

export const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

export const shouldShowInvoiceNo = ({ patientCategory, admissionStatus, recordType } = {}) => {
    if (recordType === "outside" || patientCategory === "Outsider") return false;
    if (
        patientCategory === "Outpatient" ||
        patientCategory === "Inpatient" ||
        admissionStatus === "Out-patient" ||
        admissionStatus === "In-patient"
    ) {
        return true;
    }
    return false;
};

export const buildInvoiceNoRowHtml = (invoiceNo, showInvoiceNo, variant = "print") => {
    if (!showInvoiceNo || !invoiceNo) return "";

    if (variant === "pdf") {
        return `<tr><td style="font-weight:bold; width:70px;">No</td><td style="width:10px;">:</td><td>${escapeHtml(invoiceNo)}</td></tr>`;
    }

    return `<tr><td class="label">Invoice No.</td><td>:</td><td>${escapeHtml(String(invoiceNo))}</td></tr>`;
};

/** Show blank instead of N/A or missing values in UI and PDF output. */
export const displayField = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    if (!str || str.toLowerCase() === "n/a") return "";
    return value;
};

export const buildOutsideDispensePdfData = (record) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const generatedBy = user?.name || record?.dispensedBy?.name || "";

    const createdAt = record?.createdAt ? new Date(record.createdAt) : new Date();
    const invoiceDate = createdAt.toLocaleDateString("en-IN");
    const invoiceTime = createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const invoiceNo = record?._id ? `OD-${String(record._id).slice(-8).toUpperCase()}` : "OD-XXXX";

    const customer = {
        name: record?.name || "Walk-in Customer",
        age: record?.age ?? "",
        phone: record?.phone || "",
        alternativePhone: record?.alternativePhone || "",
        address: record?.address || "",
        email: record?.email || "",
        disease: record?.disease || "",
    };

    const items = (record?.medicines || []).map((m) => {
        const qty = Number(m.dispensedQuantity) || 0;
        const total = Number(m.amount) || 0;
        const rate = qty > 0 ? total / qty : total;
        return {
            medicineName: m.medicineName || "",
            subType: m.subType || "",
            frequency: m.frequency || "",
            duration: m.duration || "",
            foodTiming: m.foodTiming || "",
            foodTime: m.foodTime || "",
            dosageSchedule: m.dosageSchedule || "",
            notes: m.notes || "",
            qty,
            rate,
            total,
        };
    });

    const subtotal = Number(record?.totalAmount) || items.reduce((sum, m) => sum + m.total, 0);
    const gstRate = Number(record?.gst || 0);
    const gstAmount = Number(record?.gstAmount ?? (subtotal * gstRate) / 100);
    const totalAmount = Number(record?.totalAmountWithGst ?? subtotal + gstAmount);
    const paidAmount = Number(record?.paidAmount || 0);
    const balanceDue = Math.max(0, Math.round((totalAmount - paidAmount) * 100) / 100);

    const formatMoney = (value) => Number(value || 0).toFixed(2);
    const grandTotal = totalAmount;
    const grandTotalStr = formatMoney(grandTotal);
    const amountInWords = `Rupees ${numberToWords(Math.round(grandTotal))} Only`;

    const paymentSummaryRows = [
        { label: "Subtotal", value: `₹${formatMoney(subtotal)}` },
        { label: `GST (${gstRate}%)`, value: `₹${formatMoney(gstAmount)}` },
        { label: "Total Amount", value: `₹${formatMoney(totalAmount)}`, bold: true },
        { label: "Paid Amount", value: `₹${formatMoney(paidAmount)}`, color: "#2e7d32" },
    ];

    if (balanceDue > 0) {
        paymentSummaryRows.push({
            label: "Balance Due",
            value: `₹${formatMoney(balanceDue)}`,
            bold: true,
            color: "#c62828",
        });
    }

    const buildPaymentSummaryHtml = (variant = "print") => {
        const fontSize = variant === "pdf" ? "12px" : "12px";
        const rowStyle = `display:flex; justify-content:space-between; padding:4px 0; font-size:${fontSize};`;
        const borderTop = "border-top:1px solid #ddd; margin-top:4px; padding-top:8px;";

        return paymentSummaryRows
            .map((row, index) => {
                const style = [
                    rowStyle,
                    row.bold ? "font-weight:bold;" : "",
                    row.color ? `color:${row.color};` : "",
                    index === 2 ? borderTop : "",
                ].join(" ");

                return `<div style="${style}"><span>${row.label}</span><span>${row.value}</span></div>`;
            })
            .join("");
    };

    const paymentSummaryHtml = buildPaymentSummaryHtml("print");
    const paymentSummaryHtmlPdf = buildPaymentSummaryHtml("pdf");
    const showInvoiceNo = false;
    const invoiceNoRowHtml = buildInvoiceNoRowHtml(invoiceNo, showInvoiceNo, "print");
    const invoiceNoRowHtmlPdf = buildInvoiceNoRowHtml(invoiceNo, showInvoiceNo, "pdf");

    const medicinesRows = items
        .map((m, i) => {
            const label = m.subType ? `${m.medicineName} (${m.subType})` : m.medicineName;
            return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:5px; font-size:11px;">${escapeHtml(label)}</td>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${m.qty}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${m.rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${m.total.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("");

    const medicinesRowsPrint = items
        .map((m, i) => {
            const label = m.subType ? `${m.medicineName} (${m.subType})` : m.medicineName;
            return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:5px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:5px;">${escapeHtml(label)}</td>
          <td style="text-align:center; border:1px solid #000; padding:5px;">${m.qty}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px;">${m.rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px;">${m.total.toFixed(2)}</td>
        </tr>
      `;
        })
        .join("");

    return {
        customer,
        invoice: {
            no: invoiceNo,
            date: invoiceDate,
            time: invoiceTime,
            dispensedBy: record?.dispensedBy?.name || generatedBy,
        },
        generatedBy,
        grandTotal,
        grandTotalStr,
        amountInWords,
        subtotal,
        gstRate,
        gstAmount,
        totalAmount,
        paidAmount,
        balanceDue,
        paymentSummaryHtml,
        paymentSummaryHtmlPdf,
        showInvoiceNo,
        invoiceNoRowHtml,
        invoiceNoRowHtmlPdf,
        medicinesRows,
        medicinesRowsPrint,
    };
};
