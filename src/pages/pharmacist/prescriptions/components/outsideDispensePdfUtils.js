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

    const grandTotal = Number(record?.totalAmount) || items.reduce((sum, m) => sum + m.total, 0);
    const grandTotalStr = grandTotal.toFixed(2);
    const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;

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
        medicinesRows,
        medicinesRowsPrint,
    };
};
