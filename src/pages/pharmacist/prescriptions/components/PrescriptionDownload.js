
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import logo from "../../../../assets/logo/logo2.png";

// Number to words (Indian style)
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
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

      if (hundreds > 0) partStr += ones[hundreds] + " Hundred ";
      if (remainder > 0) {
        if (remainder < 20) partStr += ones[remainder];
        else partStr += tens[Math.floor(remainder / 10)] + (remainder % 10 ? " " + ones[remainder % 10] : "");
      }
      str = partStr.trim() + (scales[i] ? " " + scales[i] : "") + (str ? " " + str : "");
    }
    num = Math.floor(num / 1000);
    i++;
  }
  return str.trim() || "Zero";
};

export const handleDownload = async (id) => {
  try {
    const response = await axios.get(
      getApiUrl(`examinations/user-last-prescription/${id}`),
      { headers: getAuthHeaders() }
    );

    const data = response.data?.data;
    if (!data) {
      toast.error("No prescription data found");
      return;
    }

    // ────────────────────────────────────────────────
    // Patient & basic info
    // ────────────────────────────────────────────────
    const patient = {
      name: data.patientName || "Nagaraj",
      gender: data.gender || "Male",
      age: data.age || "",
      mobile: data.mobile || "",
    };

    const invoice = {
      no: data.invoiceNo || "P-" + (data.uhid || "XXXX"),
      date: data.date || new Date().toLocaleDateString("en-IN"),
      doctor: data.doctorName || "Dr. Nagaraj",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    // ────────────────────────────────────────────────
    // Financials — using ACTUAL fields from your API
    // ────────────────────────────────────────────────
    const subtotal     = Number(data.subtotal || 0);
    const gstRate      = Number(data.gst || 0);           // e.g. 5
    const gstAmount    = Number(data.gstAmount || 0);     // e.g. 90
    const grandTotal   = Number(data.totalWithGst || 0);  // e.g. 1890

    const subtotalStr  = subtotal.toFixed(2);
    const gstAmountStr = gstAmount.toFixed(2);
    const grandTotalStr = grandTotal.toFixed(2);

    // GST rate display logic (prefer explicit gst field)
    let gstRateText = "";
    if (gstAmount > 0) {
      if (gstRate > 0) {
        gstRateText = `${gstRate}%`;
      } else if (subtotal > 0) {
        // fallback only if gst field missing (very safe rounding)
        const calculatedRate = (gstAmount / subtotal) * 100;
        gstRateText = `${Math.round(calculatedRate * 100) / 100}%`;
      }
    }

    const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;

    // ────────────────────────────────────────────────
    // Prepare medicine rows
    // ────────────────────────────────────────────────
    const items = data.medicines || [];
    const medicinesRows = items.map((m, i) => {
      const qty = Number(m.quantity || 1);
      const rate = Number(m.price || 0);
      const total = qty * rate;
      return `
        <tr>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
          <td style="border:1px solid #000; padding:5px; font-size:11px;">${m.medicineName || ""}</td>
          <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${qty}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${rate.toFixed(2)}</td>
          <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || 1), 0);

    // ────────────────────────────────────────────────
    // HTML Container for PDF
    // ────────────────────────────────────────────────
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "794px";
    container.style.minHeight = "1123px";
    container.style.padding = "20px 18px";
    container.style.border = "1px solid #000";
    container.style.boxSizing = "border-box";
    container.style.fontFamily = "Arial, Helvetica, sans-serif";
    container.style.fontSize = "12px";
    container.style.background = "#fff";

    container.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

      <!-- Header -->
      <div style="background:#fff3e0; padding:14px; text-align:center; margin-bottom:16px; ">
        <img src="${logo}" style="height:85px; object-fit:contain;" alt="Utpala Ayurdhama" />
        <div style="font-size:26px; font-weight:bold; margin:8px 0; color:#4a2c1f;">Utpala Ayurdhama</div>
        <div style="font-size:11px; line-height:1.5;">
          New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
          R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
        </div>
      </div>

      <!-- Patient + Invoice Info -->
      <div style="display:flex; border:1px solid #000; margin-bottom:16px; font-size:13px;">
        <div style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000;">
          <table style="width:100%;">
            <tr><td style="font-weight:bold; width:110px;">Patient Name</td><td>:</td><td>${patient.name}</td></tr>
            <tr><td style="font-weight:bold;">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
            <tr><td style="font-weight:bold;">Mobile</td><td>:</td><td>${patient.mobile}</td></tr>
          </table>
        </div>
        <div style="width:35%; background:#f9f5f0; padding:12px;">
          <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
            INVOICE
          </div>
          <table style="width:100%;">
            <tr><td style="font-weight:bold; width:70px;">No:</td><td>${invoice.no}</td></tr>
            <tr><td style="font-weight:bold;">Date:</td><td>${invoice.date}</td></tr>
            <tr><td style="font-weight:bold;">Time:</td><td>${invoice.time}</td></tr>
            <tr><td style="font-weight:bold;">Doctor:</td><td>${invoice.doctor}</td></tr>
          </table>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="border:1px solid #000; padding:6px; width:45px;">Srl</th>
            <th style="border:1px solid #000; padding:6px;">Item Name</th>
            <th style="border:1px solid #000; padding:6px; width:60px;">Qty</th>
            <th style="border:1px solid #000; padding:6px; width:85px;">Rate</th>
            <th style="border:1px solid #000; padding:6px; width:85px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${medicinesRows}

          <!-- Subtotal -->
          <tr style="font-weight:bold; background:#f8f8f8;">
            <td colspan="2" style="border:1px solid #000; padding:6px; text-align:right;">Sub Total</td>
            <td style="border:1px solid #000; padding:6px; text-align:center;">${totalQty}</td>
            <td style="border:1px solid #000; padding:6px;"></td>
            <td style="text-align:right; border:1px solid #000; padding:6px;">₹${subtotalStr}</td>
          </tr>

          <!-- GST Row -->
          ${gstAmount > 0 ? `
            <tr style="font-weight:bold; background:#f8f8f8;">
              <td colspan="2" style="border:1px solid #000; padding:6px; text-align:right;">GST (${gstRateText})</td>
              <td style="border:1px solid #000; padding:6px;"></td>
              <td style="border:1px solid #000; padding:6px;"></td>
              <td style="text-align:right; border:1px solid #000; padding:6px;">₹${gstAmountStr}</td>
            </tr>
          ` : ''}

          <!-- Grand Total -->
          <tr style="font-weight:bold; background:#e0e0e0; font-size:12px;">
            <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">Total (with GST)</td>
            <td style="border:1px solid #000; padding:7px;"></td>
            <td style="border:1px solid #000; padding:7px;"></td>
            <td style="text-align:right; border:1px solid #000; padding:7px;">₹${grandTotalStr}</td>
          </tr>
        </tbody>
      </table>

    

      <!-- Footer -->
      <div style="
        position: absolute;
        bottom: 12px;
        left: 18px;
        right: 18px;
        background:#5d4037;
        color:#fff;
        padding:14px 20px;
        font-size:11px;
        display:flex;
        justify-content:space-between;
        border-top:1px solid #8d6e63;
      ">
        <div style="width:48%;">
          <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">REACH US</div>
          <div><i class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>
          <div><i class="fa-solid fa-phone"></i> +91-7259195959</div>
          <div><i class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
        </div>
        <div style="width:50%; text-align:right;">
          <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">BRANCH</div>
          <div>
            <i class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br/>
            #607, Ravi Nenapu, 7th Main, Havanur Extn,<br/>
            Near Hesaraghatta Main Rd, Bengaluru – 560073<br/>
            <i class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Give browser time to render
    await new Promise(r => setTimeout(r, 1200));

    const canvas = await html2canvas(container, {
      scale: 2.8,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      height: container.scrollHeight,
      windowHeight: container.scrollHeight,
      allowTaint: true,
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

    let heightLeft = imgHeight - pdfHeight;
    let position = -pdfHeight;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      position -= pdfHeight;
    }

    pdf.save(`Prescription_${invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
    toast.success("Prescription downloaded successfully");

  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate prescription PDF");
  }
};