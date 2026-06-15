import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../config/api";
import { pdfPrHeader } from "../../../components/pdf/pdfPrHeader";
import { getFooter } from "../../../components/pdf/pdfFooter";

const IST_TIMEZONE = "Asia/Kolkata";

const toIstDateKey = (dateInput) => {
    if (!dateInput) return null;

    if (typeof dateInput === "string" && /^\d{2}-\d{2}-\d{4}/.test(dateInput)) {
        const [day, month, year] = dateInput.split("-");
        return `${year}-${month}-${day}`;
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-CA", { timeZone: IST_TIMEZONE });
};

const isWithinSelectedRange = (dateInput, startDate, endDate) => {
    const dateKey = toIstDateKey(dateInput);
    if (!dateKey || !startDate || !endDate) return false;
    return dateKey >= startDate && dateKey <= endDate;
};

const formatIstDate = (dateInput) => {
    if (!dateInput) return "-";

    if (typeof dateInput === "string" && /^\d{2}-\d{2}-\d{4}/.test(dateInput)) {
        const [day, month, year] = dateInput.split("-");
        const date = new Date(`${year}-${month}-${day}T12:00:00+05:30`);
        return date.toLocaleDateString("en-IN", {
            timeZone: IST_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        timeZone: IST_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatPeriodDate = (dateInput) => {
    if (!dateInput) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split("-");
        const date = new Date(`${year}-${month}-${day}T12:00:00+05:30`);
        return date.toLocaleDateString("en-IN", {
            timeZone: IST_TIMEZONE,
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    return formatIstDate(dateInput);
};

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

// Helper function to remove duplicate transactions
const removeDuplicates = (transactions) => {
    const seen = new Map();
    return transactions.filter(transaction => {
        // Create a unique key based on transaction properties
        const key = `${transaction.date}_${transaction.description}_${transaction.amount}_${transaction.type}`;
        if (seen.has(key)) {
            return false;
        }
        seen.set(key, true);
        return true;
    });
};

// Helper function to validate and filter transactions with zero amounts
const filterValidTransactions = (transactions) => {
    return transactions.filter(t => {
        const amount = parseFloat(t.amount || 0);
        // Filter out transactions with zero amount and ensure valid amount
        return amount !== 0 && !isNaN(amount);
    });
};

export const handlePrint = async (startDate, endDate, options = {}) => {
    const { adminView = false } = options;
    const receptionist = JSON.parse(localStorage.getItem("user"));
    const receptionistName = receptionist?.name;
    try {
        if (!startDate || !endDate) {
            alert("Please select a date range");
            return;
        }

        const startDateStr = startDate;
        const endDateStr = endDate;

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

        const response = await axios.get(getApiUrl("payments/report"), {
            headers: getAuthHeaders(),
            params: {
                startDate: startDateStr,
                endDate: endDateStr,
                format: "json",
                limit: 10000,
                ...(adminView ? { adminView: true } : {}),
            }
        });

        document.body.removeChild(loadingDiv);

        const { summary, transactions } = response.data.data;

        // Clean, deduplicate, and keep only selected IST date range
        let cleanedTransactions = removeDuplicates(transactions);
        cleanedTransactions = filterValidTransactions(cleanedTransactions);
        cleanedTransactions = cleanedTransactions.filter((transaction) =>
            isWithinSelectedRange(transaction.date || transaction.createdAt, startDateStr, endDateStr)
        );

        // Sort transactions by date (oldest first)
        cleanedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate totals from cleaned transactions
        const totalIncome = cleanedTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const totalExpense = cleanedTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const netTotal = totalIncome - totalExpense;

        // Escape HTML
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text || "";
            return div.innerHTML;
        };

        const rows = cleanedTransactions.map((t, i) => {
            const amount = parseFloat(t.amount || 0);
            return `
                <tr>
                    <td style="text-align:center; padding: 8px; border:1px solid #ddd;">${i + 1}</td>
                    <td style="padding: 8px; border:1px solid #ddd;">${formatIstDate(t.date || t.createdAt)}</td>
                    <td style="padding: 8px; border:1px solid #ddd;">${escapeHtml(t.description)}</td>
                    <td style="text-align:center; padding: 8px; border:1px solid #ddd;">${escapeHtml(t.paymentMethod || "Cash")}</td>
                    <td style="text-align:center; padding: 8px; border:1px solid #ddd; color: ${t.type === 'Income' ? '#198754' : '#dc3545'}; font-weight:bold;">${t.type}</td>
                    <td style="text-align:right; padding: 8px; border:1px solid #ddd; font-weight:bold;">₹${amount.toFixed(2)}</td>
                </tr>
            `;
        }).join("");

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Report - Utpala Ayurdhama</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
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
                .report-footer { position: fixed; bottom: 0; left: 0; right: 0; max-width: 50rem; width: 100%; margin: 0 auto; background: white; z-index: 10; }
                .footer-spacer { height: 180px; }
                .main-content { padding: 10px; width: 100%; }
                .title {
                    font-size: 22px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-align: center;
                    color: #8B4513;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .period-info {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .summary-box {
                    display: flex;
                    justify-content: center;
                    margin: 20px;
                    gap: 30px;
                }
                .summary-card {
                    flex: 0 1 300px;
                    border: 1px solid #ddd;
                    padding: 20px;
                    background: #fafafa;
                    border-radius: 8px;
                    text-align: center;
                }
                .summary-label {
                    font-size: 14px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    font-weight: bold;
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: bold;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                .items-table th,
                .items-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .items-table th {
                    background: #f5f5f5;
                    font-weight: bold;
                    text-align: center;
                }
                @media print {
                    body { border: none; margin: 0; width: 100%; max-width: none; }
                    .report-header { display: table-header-group; }
                    .report-footer { position: fixed; bottom: 0; left: 0; right: 0; max-width: 100%; width: 100%; margin: 0 auto; }
                }
            </style>
        </head>
        <body>
            <table class="report-container">
                <thead>
                    <tr>
                        <td class="report-header">
                            ${pdfPrHeader()}
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="main-content">
                                <div class="title">CONSOLIDATED PAYMENT & EXPENSE REPORT</div>
                                
                                <div class="period-info">
                                    <strong>Generated By :</strong> ${receptionistName}
                                </div>
                                <div class="period-info">
                                    <strong>Period:</strong> ${formatPeriodDate(startDateStr)} to ${formatPeriodDate(endDateStr)} (IST)
                                </div>

                                <div class="summary-box">
                                    <div class="summary-card">
                                        <div class="summary-label">Total Credit (Income)</div>
                                        <div class="summary-value" style="color: #198754;">₹${totalIncome.toFixed(2)}</div>
                                    </div>
                                    <div class="summary-card">
                                        <div class="summary-label">Total Debit (Expense)</div>
                                        <div class="summary-value" style="color: #dc3545;">₹${totalExpense.toFixed(2)}</div>
                                    </div>
                                </div>

                                ${cleanedTransactions.length > 0 ? `
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
                                            <td colspan="5" style="text-align:right; padding: 10px; border:1px solid #ddd;">TOTAL CREDIT</td>
                                            <td style="text-align:right; padding: 10px; border:1px solid #ddd; color: #198754;">₹${totalIncome.toFixed(2)}</td>
                                        </tr>
                                        <tr style="background: #f9f9f9; font-weight: bold;">
                                            <td colspan="5" style="text-align:right; padding: 10px; border:1px solid #ddd;">TOTAL DEBIT</td>
                                            <td style="text-align:right; padding: 10px; border:1px solid #ddd; color: #dc3545;">₹${totalExpense.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                ` : `
                                <div style="text-align:center; margin: 40px; padding: 20px; color: #666;">
                                    No transactions found for the selected period.
                                </div>
                                `}
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <div class="footer-spacer"></div>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="report-footer">
                ${getFooter()}
            </div>

            <script>
                window.onload = () => { 
                    setTimeout(() => { 
                        window.print(); 
                    }, 500); 
                }
            </script>
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
        const loadingDiv = document.querySelector('div[style*="position: fixed"]');
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        alert("Failed to generate report. Please try again.");
    }
};