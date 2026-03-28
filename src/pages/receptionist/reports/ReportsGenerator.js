import axios from "axios";
import logo from "../../../assets/logo/logo2.png";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Indian rupees number to words
const numberToWords = (num) => {
    if (num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertToWords = (n) => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertToWords(n % 100) : "");
        if (n < 100000) {
            const thousands = Math.floor(n / 1000);
            const remainder = n % 1000;
            return convertToWords(thousands) + " Thousand" + (remainder ? " " + convertToWords(remainder) : "");
        }
        if (n < 10000000) {
            const lakhs = Math.floor(n / 100000);
            const remainder = n % 100000;
            return convertToWords(lakhs) + " Lakh" + (remainder ? " " + convertToWords(remainder) : "");
        }
        if (n < 1000000000) {
            const crores = Math.floor(n / 10000000);
            const remainder = n % 10000000;
            return convertToWords(crores) + " Crore" + (remainder ? " " + convertToWords(remainder) : "");
        }
        return n.toString();
    };

    return convertToWords(num);
};

export const handlePrint = async (startDate, endDate) => {
    try {
        if (!startDate || !endDate) {
            alert("Please select a date range");
            return;
        }

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            text-align: center;
            font-family: Arial, sans-serif;
        `;
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #8B4513; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <div>Generating Report...</div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(loadingDiv);

        // API Call
        const startDateISO = new Date(startDate);
        startDateISO.setHours(0, 0, 0, 0);
        const endDateISO = new Date(endDate);
        endDateISO.setHours(23, 59, 59, 999);

        const response = await axios.get(getApiUrl("payments/report"), {
            headers: getAuthHeaders(),
            params: {
                startDate: startDateISO.toISOString(),
                endDate: endDateISO.toISOString(),
                format: "json",
                limit: 1000 // Get all for printing
            }
        });

        document.body.removeChild(loadingDiv);

        const { summary, transactions } = response.data.data;
        const totalIncome = summary.totalIncome || 0;
        const totalExpense = summary.totalExpense || 0;
        const netTotal = summary.netTotal || 0;

        // Escape HTML
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text || "";
            return div.innerHTML;
        };

        // Format Date Helper for table
        const formatDate = (dateStr) => {
            if (!dateStr) return "-";
            let date;
            if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
                const [d, m, y] = dateStr.split('-');
                date = new Date(`${y}-${m}-${d}`);
            } else {
                date = new Date(dateStr);
            }
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const rows = transactions.map((t, i) => `
            <tr>
                <td style="text-align:center; padding: 8px; border:1px solid #ddd;">${i + 1}</td>
                <td style="padding: 8px; border:1px solid #ddd;">${formatDate(t.date)}</td>
                <td style="padding: 8px; border:1px solid #ddd;">${escapeHtml(t.description)}</td>
                <td style="text-align:center; padding: 8px; border:1px solid #ddd;">${escapeHtml(t.paymentMethod || "Cash")}</td>
                <td style="text-align:center; padding: 8px; border:1px solid #ddd; color: ${t.type === 'Income' ? '#198754' : '#dc3545'}; font-weight:bold;">${t.type}</td>
                <td style="text-align:right; padding: 8px; border:1px solid #ddd; font-weight:bold;">₹${(t.amount || 0).toFixed(2)}</td>
            </tr>
        `).join("");

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Report - Utpala Ayurdhama</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
                .report-container { max-width: 1000px; margin: 0 auto; background: white; border: 1px solid #ddd; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #8B4513; padding-bottom: 15px; margin-bottom: 20px; }
                .clinic-name { font-size: 24px; font-weight: bold; color: #8B4513; margin: 5px 0; }
                .title { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; color: #8B4513; text-transform: uppercase; }
                .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .summary-box { border: 1px solid #ddd; padding: 15px; background: #fafafa; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 20px; }
                .summary-item { text-align: center; flex: 1; }
                .summary-label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
                .summary-value { font-size: 16px; font-weight: bold; }
                .items-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                .items-table th { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; text-align: center; }
                .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; color: #666; }
                @media print {
                    body { padding: 0; }
                    .report-container { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <img src="${logo}" style="height: 60px;" />
                    <div class="clinic-name">Utpala Ayurdhama</div>
                    <div style="font-size: 10px; color: #666;">New BEL Rd, Bengaluru, Karnataka 560094</div>
                </div>

                <div class="title">CONSOLIDATED PAYMENT & EXPENSE REPORT</div>
                
                <div style="text-align:center; margin-bottom: 20px; font-size: 12px;">
                    <strong>Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}
                </div>

                <div class="summary-box">
                    <div class="summary-item">
                        <div class="summary-label">Total Income</div>
                        <div class="summary-value" style="color: #198754;">₹${totalIncome.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Expense</div>
                        <div class="summary-value" style="color: #dc3545;">₹${totalExpense.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Net Balance</div>
                        <div class="summary-value" style="color: ${netTotal >= 0 ? '#198754' : '#dc3545'};">₹${netTotal.toFixed(2)}</div>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%">#</th>
                            <th style="width: 12%">Date</th>
                            <th style="width: 43%">Description</th>
                            <th style="width: 15%">Method</th>
                            <th style="width: 10%">Type</th>
                            <th style="width: 15%">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f9f9f9; font-weight: bold;">
                            <td colspan="5" style="text-align:right; padding: 10px; border:1px solid #ddd;">GRAND TOTAL (NET)</td>
                            <td style="text-align:right; padding: 10px; border:1px solid #ddd; color: ${netTotal >= 0 ? '#198754' : '#dc3545'}; font-size: 12px;">₹${netTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 30px; font-style: italic; font-size: 11px;">
                    <strong>Amount in Words:</strong> Rupees ${numberToWords(Math.round(Math.abs(netTotal)))} ${netTotal < 0 ? 'Debit' : 'Only'}
                </div>

                <div class="footer">
                    <div>Generated on: ${new Date().toLocaleString()}</div>
                    <div style="text-align:right;">
                        <br/><br/>
                        _________________________<br/>
                        Authorized Signatory
                    </div>
                </div>
            </div>
            <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); }</script>
        </body>
        </html>
        `;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        } else {
            alert("Popup blocked! Please allow popups to print the report.");
        }

    } catch (error) {
        console.error("Error generating report:", error);
        alert("Failed to generate report. Please try again.");
    }
};