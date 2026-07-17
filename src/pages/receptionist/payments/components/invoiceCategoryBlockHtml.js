import { getFoodChargeDisplay } from "../utils/foodChargeDisplay";

const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const cellStyle = (extra = "") =>
  `border:1px solid #000; padding:8px 6px; font-size:10px; vertical-align:top; word-break:break-word; ${extra}`;

const thStyle = (extra = "") =>
  `border:1px solid #000; padding:8px 6px; font-size:10px; font-weight:700; background:#f8f9fa; text-align:center; ${extra}`;

export const categorizeInvoicePdfItem = (item) => {
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

const CATEGORY_ORDER = [
  "Doctor Consultation",
  "Therapy",
  "Medicines",
  "Food Charges",
  "Bed Charges",
  "Other",
];

const buildTherapyColgroup = () => `
  <colgroup>
    <col style="width:5%;" />
    <col style="width:28%;" />
    <col style="width:27%;" />
    <col style="width:8%;" />
    <col style="width:16%;" />
    <col style="width:16%;" />
  </colgroup>
`;

export const buildInvoiceCategoryBlockHtmls = (invoice, formatCurrency, options = {}) => {
  const isPaymentReceipt = Boolean(options.isPaymentReceipt ?? options.hideConsultationAndTherapy);
  const hiddenCategories = isPaymentReceipt
    ? new Set(["Doctor Consultation", "Therapy", "Food Charges", "Bed Charges"])
    : null;

  const items = invoice.items || [];
  const grouped = {};

  items.forEach((item) => {
    const cat = categorizeInvoicePdfItem(item);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let counter = 0;
  let isFirstBlock = true;
  const categoryBlockHtmls = [];

  CATEGORY_ORDER.forEach((cat) => {
    if (hiddenCategories?.has(cat)) return;

    const catItems = grouped[cat];
    if (!catItems?.length) return;

    const catTotal = catItems.reduce((sum, i) => sum + (i.total || i.amount || 0), 0);
    const isTherapy = cat === "Therapy";
    const isConsultation = cat === "Doctor Consultation";
    const isBedCharges = cat === "Bed Charges";
    const isFood = cat === "Food Charges";

    if (isConsultation && catTotal === 0) return;

    const hideCategoryHeader = isTherapy || isConsultation || isBedCharges || isFood;
    const blockMarginTop = hideCategoryHeader ? "0" : isFirstBlock ? "1px" : "3px";
    isFirstBlock = false;
    // Single-line borders only (no border-top:none). Avoids double lines in PDF/html2canvas.
    const therapyTh = (extra = "") =>
      `border:1px solid #000; padding:0 6px 8px 6px; font-size:10px; font-weight:700; background:#f8f9fa; text-align:center; ${extra}`;
    const therapyTd = (extra = "") =>
      `border:1px solid #000; padding:0 6px 8px 6px; font-size:10px; vertical-align:top; word-break:break-word; ${extra}`;
    const headerPad = "10px 12px";
    const categoryHeaderHtml = hideCategoryHeader
      ? ""
      : `<div style="background:#e8f4f8; padding:${headerPad}; display:flex; justify-content:space-between; align-items:center; font-weight:700; font-size:12px; border-bottom:1px solid #000;">
          <span>${cat}</span>
          <span>Total: ₹${formatCurrency(catTotal)}</span>
        </div>`;
    const nameColumnLabel = isTherapy
      ? "THERAPY NAME"
      : isConsultation
        ? "DOCTOR NAME"
        : isBedCharges
          ? "BED TYPE"
          : isFood
            ? "FOOD NAME"
            : "Service Name";

    let blockHtml = `
      <div style="margin-top:${blockMarginTop}; overflow:hidden;">
        ${categoryHeaderHtml}
        <table style="width:100%; border:1px solid #000; border-collapse:collapse; border-spacing:0; table-layout:fixed; font-family:Arial, Helvetica, sans-serif; margin:0;">
          ${isTherapy ? buildTherapyColgroup() : ""}
          <thead>
            <tr>
              <th style="${isTherapy ? therapyTh("width:40px;") : thStyle("width:40px;")}">#</th>
              <th style="${isTherapy ? therapyTh() : thStyle()}">${nameColumnLabel}</th>
              ${!isBedCharges && !isTherapy && !isConsultation ? `<th style="${thStyle()}">DESCRIPTION</th>` : ""}
              ${isTherapy ? `<th style="${therapyTh()}">TREATMENT DESCRIPTION</th><th style="${therapyTh("width:55px;")}">SESSIONS</th>` : ""}
              <th style="${isTherapy ? therapyTh("text-align:center;") : thStyle("text-align:center;")}">${isConsultation ? "CONSULTATION" : "UNIT PRICE"}</th>
              <th style="${isTherapy ? therapyTh("text-align:center;") : thStyle("text-align:center;")}">TOTAL</th>
            </tr>
          </thead>
          <tbody>
    `;

    catItems.forEach((item) => {
      counter += 1;
      const qty = item.dispensedQuantity || item.quantity || 1;
      const unitPrice = item.unitPrice || item.amount || 0;
      const total = item.total || item.amount || 0;
      const foodDisplay = isFood ? getFoodChargeDisplay(item) : null;
      const doctorDisplayName =
        (item.total || item.amount || 0) > 0
          ? (item.doctorName || invoice.doctor?.user?.name || "")
          : "";
      const displayName = isConsultation
        ? doctorDisplayName || item.name || "Item"
        : foodDisplay?.name || item.name || "Item";
      const displayDescription = foodDisplay?.description || item.description || "";
      const therapySubTherapy = (item.subTherapy || "").trim() || "_";
      const therapyDescription = (item.description || item.subTherapyDescription || "").trim() || "_";

      blockHtml += `
        <tr>
          <td style="${isTherapy ? therapyTd("text-align:center;") : cellStyle("text-align:center;")}">${counter}</td>
          <td style="${isTherapy ? therapyTd("text-align:left;") : cellStyle("text-align:center;")}">
            <div style="font-weight:${isTherapy ? "600" : "500"}; font-size:10px; line-height:1.35; margin:0;">${escapeHtml(displayName)}</div>
            ${isTherapy ? `<div style="font-size:9px; color:#666; margin:0; line-height:1.35; white-space:pre-line;">${escapeHtml(therapySubTherapy)}</div>` : ""}
            ${item.remarks ? `<div style="font-size:9px; color:#666; font-style:italic; margin-top:3px;">Remarks: ${escapeHtml(item.remarks)}</div>` : ""}
          </td>
          ${!isBedCharges && !isTherapy && !isConsultation ? `
            <td style="${cellStyle("text-align:center;")}">
              ${displayDescription ? escapeHtml(displayDescription).replace(/\n/g, "<br>") : "—"}
            </td>
          ` : ""}
          ${isTherapy ? `
            <td style="${therapyTd("text-align:left;")}">${escapeHtml(therapyDescription)}</td>
            <td style="${therapyTd("text-align:center;")}">${qty}</td>
          ` : ""}
          <td style="${isTherapy ? therapyTd("text-align:center;") : cellStyle("text-align:center;")}">₹${formatCurrency(unitPrice)}</td>
          <td style="${isTherapy ? therapyTd("text-align:center; font-weight:700;") : cellStyle("text-align:center; font-weight:700;")}">₹${formatCurrency(total)}</td>
        </tr>
      `;
    });

    blockHtml += `
          </tbody>
        </table>
      </div>
    `;
    categoryBlockHtmls.push(blockHtml);
  });

  return categoryBlockHtmls;
};
