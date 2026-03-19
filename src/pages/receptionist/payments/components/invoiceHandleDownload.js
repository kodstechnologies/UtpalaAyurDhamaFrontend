

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import logo from "../../../../assets/logo/logo2.png";

// ── Reused helpers (same as in print version) ──
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
 * Download invoice as PDF — design matched to invoiceHandlePrint
 */
export const invoiceHandleDownload = async (invoice) => {
  if (!invoice) {
    toast.error("No invoice data available");
    return;
  }

  try {
    const patient = {
      name: invoice.patient?.user?.name || invoice.patient?.name || "N/A",
      gender: invoice.patient?.user?.gender || invoice.patient?.gender || "N/A",
      age: invoice.patient?.age || "N/A",
      phone: invoice.patient?.user?.phone || "N/A",
      email: invoice.patient?.user?.email || "N/A",
      uhid: invoice.patient?.uhid || invoice.patient?.patientId || "",
      address: invoice.patient?.user?.address || "N/A",
    };

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
    let itemsHtml = "";

    categoryOrder.forEach((cat) => {
      const catItems = grouped[cat];
      if (!catItems || catItems.length === 0) return;

      const catTotal = catItems.reduce((sum, i) => sum + (i.total || i.amount || 0), 0);

      itemsHtml += `
        <tr>
          <td colspan="5" style="border:1px solid #000; padding:6px; font-weight:bold; font-size:12px;">${cat}</td>
          <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; font-size:12px;">₹${formatCurrency(catTotal)}</td>
        </tr>
      `;

      catItems.forEach((item) => {
        counter++;
        const qty = item.dispensedQuantity || item.quantity || 1;
        const unitPrice = item.unitPrice || item.amount || 0;
        const total = item.total || item.amount || 0;

        itemsHtml += `
          <tr>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${counter}</td>
            <td style="border:1px solid #000; padding:5px; font-size:11px;">${item.name || "Item"}</td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${item.description || ""}</td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">${qty}</td>
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:11px;">₹${formatCurrency(unitPrice)}</td>
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:11px;">₹${formatCurrency(total)}</td>
          </tr>
        `;
      });
    });

    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discountValue || 0;
    const discountText = invoice.discountType === "percentage"
      ? `Discount (${invoice.discountRate || 0}%)`
      : discount > 0 ? "Discount (Fixed)" : "";

    const totalPayable = invoice.totalPayable || 0;
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = totalPayable - amountPaid;

    const paymentStatus = amountPaid >= totalPayable ? "PAID" : amountPaid > 0 ? "PARTIALLY PAID" : "UNPAID";
    const statusColor = amountPaid >= totalPayable ? "#2e7d32" : amountPaid > 0 ? "#f57c00" : "#d32f2f";

    const amountInWords = `Rupees ${numberToWords(Math.round(totalPayable))} Only`;

    // ── HTML structure (very close to print version) ──
    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#000; width:794px; padding:15px; border:1px solid #000; background:#fff; box-sizing:border-box;">
      
        <!-- HEADER -->
        <div style="display:flex; align-items:center; padding:12px 15px; background:#f4d7b5; ">
          <img src="${logo}" style="height:70px; margin-right:15px;" alt="Logo"/>
          <div style="flex:1;">
            <div style="font-size:18px; font-weight:bold; color:#4e342e;">UTPALA AYURDHAMA</div>
            <div style="font-size:11px; color:#333; margin-top:4px; line-height:1.4;">
              New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
              R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
            </div>
          </div>
      
        </div>

        <!-- PATIENT + INVOICE INFO -->
        <div style="display:flex; border:1px solid #000; margin:10px 0;">
          <div style="width:60%; background:#fafafa; padding:12px; border-right:1px solid #000;">
            <table style="width:100%; font-size:12px;">
              <tr><td style="font-weight:bold; width:100px;">NAME</td><td>:</td><td>${patient.name}</td></tr>
              ${doctorName !== "N/A" ? `<tr><td style="font-weight:bold;">DOCTOR</td><td>:</td><td>${doctorName}</td></tr>` : ""}
              ${patient.uhid ? `<tr><td style="font-weight:bold;">UHID</td><td>:</td><td>${patient.uhid}</td></tr>` : ""}
              <tr><td style="font-weight:bold;">AGE/GENDER</td><td>:</td><td>${patient.age} / ${patient.gender}</td></tr>
              ${patient.phone !== "N/A" ? `<tr><td style="font-weight:bold;">PHONE</td><td>:</td><td>${patient.phone}</td></tr>` : ""}
              ${patient.email !== "N/A" ? `<tr><td style="font-weight:bold;">E-MAIL</td><td>:</td><td>${patient.email}</td></tr>` : ""}
              ${patient.address !== "N/A" ? `<tr><td style="font-weight:bold;">ADDRESS</td><td>:</td><td>${patient.address}</td></tr>` : ""}
            </table>
          </div>
          
      <div style="width:40%; border-left:1px solid #000;">


            <div style="text-align:center; font-weight:bold; font-size:16px; border-bottom:1px solid #000; padding:8px; background:#f5f0eb;">
              INVOICE DETAILS
            </div>
        <table style="width:100%; font-size:12px; border-collapse:collapse; margin-top:5px; margin-left:5px;">

  <tr>
    <td style="font-weight:bold; width:45%; padding:6px 0;">Invoice No</td>
    <td style="padding:6px 0;">: ${invoiceNo}</td>
  </tr>

  <tr>
    <td style="font-weight:bold; padding:6px 0;">Date</td>
    <td style="padding:6px 0;">: ${invoiceDate}</td>
  </tr>

  <tr>
    <td style="font-weight:bold; padding:6px 0;">Time</td>
    <td style="padding:6px 0;">: ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
  </tr>

<tr >
  <td style="font-weight:bold; padding:6px 0;  vertical-align:middle;">Status</td>
  <td style="">
    <span style="
      display:inline-flex;
      align-items:center;
      justify-content:center;

      color:${statusColor};
      padding:3px 10px;
      border-radius:4px;
      font-weight:600;
      font-size:11px;
    ">
      ${paymentStatus}
    </span>
  </td>
</tr>

</table>
            
            
            </table>
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="">
              <th style="border:1px solid #000; padding:6px; width:40px;">Srl</th>
              <th style="border:1px solid #000; padding:6px;">Item Name</th>
              <th style="border:1px solid #000; padding:6px;">Description</th>
              <th style="border:1px solid #000; padding:6px; width:60px;">Qty</th>
              <th style="border:1px solid #000; padding:6px; width:90px;">Unit Price</th>
              <th style="border:1px solid #000; padding:6px; width:90px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="font-weight:bold;">
              <td colspan="5" style="border:1px solid #000; padding:6px;">SUBTOTAL</td>
              <td style="border:1px solid #000; padding:6px; text-align:right;">₹${formatCurrency(subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <!-- SUMMARY + NOTES -->
        <div style="display:flex; margin-top:15px; padding-top:10px;">
          <div style="width:55%; padding-right:15px;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:6px;">Amount in Words:</div>
            <div style="font-style:italic; font-size:12px;">${amountInWords}</div>

            ${invoice.payments?.length > 0 ? `
              <div style="margin-top:20px; font-weight:bold; font-size:13px;">Payment History:</div>
              ${invoice.payments.map((p, i) => `
                <div style="font-size:11px; margin-top:4px;">
                  ${i + 1}. ₹${formatCurrency(p.amount)} via ${p.method || "Cash"} on ${formatDate(p.paidAt || p.createdAt)}
                </div>
              `).join("")}
            ` : ""}
          </div>

          <div style="width:45%; font-size:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span>Subtotal:</span><span>₹${formatCurrency(subtotal)}</span>
            </div>
            ${discount > 0 ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#2e7d32;">
                <span>${discountText}:</span><span>-₹${formatCurrency(discount)}</span>
              </div>
            ` : ""}
            <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold; border-top:2px solid #000; padding-top:8px; margin-top:8px;">
              <span>TOTAL PAYABLE:</span><span>₹${formatCurrency(totalPayable)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; color:#2e7d32;">
              <span>Amount Paid:</span><span>₹${formatCurrency(amountPaid)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; color:${statusColor}; margin-top:6px;">
              <span>Balance Due:</span><span>₹${formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>

        <!-- NOTES + SIGNATURE -->
        <div style=" margin-top:20px; padding:12px 0; font-size:11px; line-height:1.5;">
          <div style="display:flex; justify-content:space-between;">
            <div style="width:70%;">
              <div style="font-weight:bold; margin-bottom:6px;">Notes:</div>
              <div>• Ensure to verify the invoice before you leave.</div>
              <div>• If you have any questions or concerns about this invoice, please contact or E-mail us.</div>
              <div>• Thank you for your continued trust and support!</div>
              <div>• We greatly appreciate your visit. You're a valued customer at UTPALA AYURDHAMA.</div>
              <div>• To know more about our services please visit https://utpalaayurdhama.com</div>
              <div style="margin-top:10px; font-weight:bold;">Please visit us again...!</div>
            </div>
            <div style="width:25%; text-align:right;">
              <div style="margin-top:40px;">For UTPALA AYURDHAMA</div>
              <div style="margin-top:40px;">Authorized Signature</div>
            </div>
          </div>

          <div style="text-align:center; margin-top:15px; font-size:10px; color:#555;">
            This is a system generated invoice. You can use invoice number to track in future.
          </div>
        </div>

        <!-- FOOTER -->
        <div style="margin-top:20px; background:#5d4037; color:#fff; display:flex; justify-content:space-between; padding:15px 20px; font-size:11px; ">
          <div style="width:40%;">
            <div style="font-weight:bold; margin-bottom:6px; font-size:13px;">REACH US AT</div>
            <div><i style="margin-right:6px;" class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>
            <div><i style="margin-right:6px;" class="fa-solid fa-phone"></i> +91-7259195959</div>
            <div><i style="margin-right:6px;" class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
          </div>
          <div style="width:2px; background:rgba(255,255,255,0.5);"></div>
          <div style="width:55%;">
            <div style="font-weight:bold; margin-bottom:6px; font-size:13px;">OUR BRANCH(S)</div>
            <div>
              <i style="margin-right:6px;" class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br>
              #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br>
              Near Hesaraghatta Main Road, Bengaluru – 560073<br>
              <i style="margin-right:6px;" class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
            </div>
          </div>
        </div>
      </div>
    `;

    // Create off-screen container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.background = "#fff";
    container.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      ${htmlContent}
    `;
    document.body.appendChild(container);

    // Generate canvas
    const canvas = await html2canvas(container, {
      scale: 2.5,           // higher quality
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: container.scrollHeight,
    });

    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/png");

    // Fit content to one page (most invoices should fit)
    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;

    pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);

    // If content is too long → add extra pages (rare for invoices)
    if (imgH > pdfHeight) {
      let position = 0;
      while (position < canvas.height) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -position * (pdfHeight / canvas.height * canvas.width / pdfWidth), pdfWidth, 0);
        position += pdfHeight * (canvas.height / pdfHeight);
      }
    }

    pdf.save(`Invoice_${invoiceNo.replace(/[\/\\]/g, "-")}.pdf`);
    toast.success("Invoice downloaded successfully");

  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate PDF");
  }
};