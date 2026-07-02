const formatPaymentMethodForSummary = (method) => {
  if (method === "Online" || method === "UPI") return "UPI";
  return method || "Cash";
};

const summaryAmountRow = (label, value, options = {}) => `
  <tr>
    <td style="padding:${options.padding || "4px 0"}; font-size:${options.fontSize || "12px"}; font-weight:${options.bold ? "bold" : "normal"}; color:${options.color || "#000"}; border-top:${options.borderTop ? "2px solid #000" : "none"}; padding-top:${options.borderTop ? "10px" : "4px"};">
      ${label}
    </td>
    <td align="right" style="padding:${options.padding || "4px 0"}; font-size:${options.fontSize || "12px"}; font-weight:${options.bold ? "bold" : "normal"}; color:${options.color || "#000"}; border-top:${options.borderTop ? "2px solid #000" : "none"}; padding-top:${options.borderTop ? "10px" : "4px"};">
      ₹${value}
    </td>
  </tr>
`;

export const buildInvoiceSummarySectionHtml = ({
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
}) => {
  const balanceColor = balanceDue <= 0 ? "#2e7d32" : "#000";
  const paidColor = "#2e7d32";

  const paymentHistoryHtml = paymentsForHistory.length
    ? `
      <div style="margin-top:18px; font-weight:bold; font-size:13px; margin-bottom:8px;">Payment History:</div>
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        ${paymentsForHistory.map((p, i) => `
          <tr>
            <td style="padding:3px 8px 3px 0; vertical-align:top; width:18px; white-space:nowrap;">${i + 1}.</td>
            <td style="padding:3px 0; line-height:1.6; word-break:break-word;">
              ₹${formatCurrency(p.amount)} via ${formatPaymentMethodForSummary(p.paymentMethod)} on ${formatDate(p.date)}
              ${p.transactionId ? ` | ID: ${p.transactionId}` : ""}
              ${p.cardLastFourDigits ? ` | Card: •••• ${p.cardLastFourDigits}` : ""}
            </td>
          </tr>
        `).join("")}
      </table>
    `
    : "";

  const rightColumnRows = isSinglePaymentReceipt
    ? `
      ${summaryAmountRow("Subtotal:", formatCurrency(subtotal))}
      ${taxAmount > 0 ? summaryAmountRow(`Tax (${invoice.taxRate}%):`, formatCurrency(taxAmount)) : ""}
      ${discountAmount > 0 ? `
        <tr>
          <td style="padding:4px 0; font-size:12px; color:#2e7d32;">${discountText}:</td>
          <td align="right" style="padding:4px 0; font-size:12px; color:#2e7d32;">-₹${formatCurrency(discountAmount)}</td>
        </tr>
      ` : ""}
      ${summaryAmountRow("TOTAL PAYABLE:", formatCurrency(totalPayable), { bold: true, fontSize: "14px", borderTop: true })}
      ${summaryAmountRow("Amount Paid:", formatCurrency(receiptAmount), { color: paidColor })}
      ${summaryAmountRow("Balance Due:", formatCurrency(balanceDue), { bold: true, fontSize: "13px", color: balanceColor, padding: "6px 0 0 0" })}
    `
    : `
      ${summaryAmountRow("Subtotal:", formatCurrency(subtotal))}
      ${taxAmount > 0 ? summaryAmountRow(`Tax (${invoice.taxRate}%):`, formatCurrency(taxAmount)) : ""}
      ${discountAmount > 0 ? `
        <tr>
          <td style="padding:4px 0; font-size:12px; color:#2e7d32;">${discountText}:</td>
          <td align="right" style="padding:4px 0; font-size:12px; color:#2e7d32;">-₹${formatCurrency(discountAmount)}</td>
        </tr>
      ` : ""}
      ${summaryAmountRow("TOTAL PAYABLE:", formatCurrency(totalPayable), { bold: true, fontSize: "14px", borderTop: true })}
      ${summaryAmountRow("Amount Paid:", formatCurrency(displayAmountPaid), { color: paidColor })}
      ${summaryAmountRow("Balance Due:", formatCurrency(balanceDue), { bold: true, fontSize: "13px", color: balanceColor, padding: "6px 0 0 0" })}
    `;

  return `
    <div style="width:794px; box-sizing:border-box; padding:0 15px 8px; font-family:Arial, Helvetica, sans-serif; color:#000; background:#fff;">
      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <tr>
          <td></td>
          <td align="right" style="width:50%;">
            <table style="width:100%; border-collapse:collapse; border:1px solid #000;">
              <tr style="font-weight:bold;">
                <td style="padding:10px; border-right:1px solid #000;">${subtotalBoxLabel}</td>
                <td align="right" style="padding:10px;">₹${formatCurrency(displaySubtotal)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table style="width:100%; border-collapse:collapse; margin-top:18px;">
        <tr>
          <td style="width:55%; vertical-align:top; padding-right:20px;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:6px;">Amount in Words:</div>
            <div style="font-style:italic; font-size:12px; line-height:1.5;">${amountInWords}</div>
            ${paymentHistoryHtml}
          </td>
          <td style="width:45%; vertical-align:top;">
            <table style="width:100%; border-collapse:collapse;">
              ${rightColumnRows}
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};
