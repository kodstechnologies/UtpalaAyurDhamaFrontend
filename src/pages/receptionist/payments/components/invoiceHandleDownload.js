import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import logo from "../../../../assets/logo/logo2.png";

// Simple Indian rupees number to words (basic – extend for production)
const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const hundreds = ["", "One Hundred", "Two Hundred", "Three Hundred", "Four Hundred", "Five Hundred",
    "Six Hundred", "Seven Hundred", "Eight Hundred", "Nine Hundred"];

  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 ? " " + numberToWords(num % 100) : "");
  return num.toString();
};

export const invoiceHandleDownload = async (id) => {
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

    // Map API data fields (same as PrescriptionGenerator.js)
    const patient = {
      name: data.patientName || "MRS. SUPRITA SHETTY",
      gender: data.gender || "Female",
      age: data.age || "",
      address: data.address || "YESWANTHPUR",
      mobileOrUHID: data.uhid || "91842846456",
      email: data.email || "",
      gstin: data.patientGSTIN || ""
    };

    const invoice = {
      no: data.invoiceNo || "S/25-26/135",
      date: data.invoiceDate || new Date().toLocaleDateString("en-IN"),
      referenceDate: data.referenceDate || new Date().toLocaleDateString("en-IN"),
      doctor: data.doctorName || "Dr. Rajeshwari"
    };

    // Medicines
    const items = data.medicines || [];
    const medicinesRows = items.map((m, i) => `
      <tr>
        <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
        <td style="border:1px solid #000; padding:5px; font-size:11px;">${m.medicineName || m.itemName || "Sarasapilla Syrup"}</td>
        <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${m.hsnCode || "32"}</td>
        <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${m.quantity || "1.00"}</td>
        <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${m.uom || "Nos"}</td>
        <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${Number(m.rate || m.price || 360).toFixed(2)}</td>
        <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${Number(m.amount || 360).toFixed(2)}</td>
        <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${Number(m.gstPercent || 5).toFixed(2)}</td>
        <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${Number(m.gstAmount || 17.14).toFixed(2)}</td>
        <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${Number(m.total || 360).toFixed(2)}</td>
      </tr>
    `).join("");

    const subtotal = Number(data.subtotal || 342.86).toFixed(2);
    const gstAmount = Number(data.gstAmount || 17.14).toFixed(2);
    const totalWithGst = Number(data.totalWithGst || 360.00).toFixed(2);

    const amountInWords = `Rs. ${numberToWords(Math.round(totalWithGst))} Only`;

    // ── Create off-screen container matching PrescriptionGenerator.js layout exactly ──
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.minHeight = "1123px";
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.fontFamily = "Arial, Helvetica, sans-serif";
    container.style.fontSize = "12px";
    container.style.color = "#000";
    container.style.border = "1px solid black";
    container.style.backgroundColor = "white";
    container.style.display = "flex";
    container.style.flexDirection = "column";

    container.innerHTML = `
      <!-- ═══ HEADER ═══ -->
      <div style="background:#fff3e0; padding:10px; text-align:center; border-bottom:2px solid #000;">
        <div style="font-size:28px; font-weight:bold; color:#000; margin:5px 0;">
          <img src="${logo}" style="height:200px;" />
        </div>
        <div style="font-size:28px; font-weight:bold; color:#000; margin:5px 0;">Utpala Ayurdham</div>
        <div style="font-size:11px; margin:5px 0;">
          New BEL Rd, Chikkamaranahalli, Dollars Colony, R.M.V. 2nd Stage,
          Bengaluru, Karnataka 560094
          info@utpalaayurdhama.com
          GSTIN: 29ACXPL2065P1ZL
        </div>
      </div>

      <!-- ═══ PATIENT + RECEIPT DETAILS ═══ -->
      <div style="display:flex; border:1px solid #000; margin-top:10px;">
        <!-- Patient Box -->
        <div style="width:65%; background:#f2f2f2; padding:10px; border-right:1px solid #000;">
          <table style="width:100%; font-size:13px;">
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">NAME</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.name}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">AGE</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.age}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">GENDER</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.gender}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">PHONE</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.mobileOrUHID}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">E-MAIL</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.email || ""}</td>
            </tr>
            <tr>
              <td style="font-weight:bold; width:140px; padding:3px 5px;">ADDRESS</td>
              <td style="width:10px; padding:3px 5px;">:</td>
              <td style="padding:3px 5px;">${patient.address}</td>
            </tr>
          </table>
        </div>

        <!-- Receipt Box -->
        <div style="width:35%; background:#f2f2f2;">
          <div style="text-align:center; font-weight:bold; font-size:18px; border-bottom:1px solid #000; padding:8px;">RECEIPT DETAILS</div>
          <table style="width:100%; padding:10px; font-size:13px;">
            <tr>
              <td style="padding:5px;">Receipt No:</td>
              <td style="padding:5px;">${invoice.no}</td>
            </tr>
            <tr>
              <td style="padding:5px;">Date</td>
              <td style="padding:5px;">${invoice.date}</td>
            </tr>
            <tr>
              <td style="padding:5px;">Time</td>
              <td style="padding:5px;">${new Date().toLocaleTimeString()}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- ═══ ITEMS TABLE ═══ -->
      <table style="width:100%; border-collapse:collapse; margin:10px 0;">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Srl</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Item Name</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">HSN Code</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Qty</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Uom</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Rate</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Amount</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">GST %</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">GST-Amt</th>
            <th style="border:1px solid #000; padding:5px; font-size:11px; background:#f5f5f5; text-align:center;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${medicinesRows}
          <tr style="font-weight:bold; background:#f0f0f0;">
            <td colspan="2" style="border:1px solid #000; padding:5px; font-size:11px;">TOTAL</td>
            <td style="border:1px solid #000; padding:5px; font-size:11px;"></td>
            <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${items.length ? items.reduce((sum, m) => sum + Number(m.quantity || 1), 0).toFixed(2) : "1.00"}</td>
            <td style="border:1px solid #000; padding:5px; font-size:11px;"></td>
            <td style="border:1px solid #000; padding:5px; font-size:11px;"></td>
            <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${subtotal}</td>
            <td style="border:1px solid #000; padding:5px; font-size:11px;"></td>
            <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${gstAmount}</td>
            <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${totalWithGst}</td>
          </tr>
        </tbody>
      </table>

      <!-- ═══ PAYMENT CONTAINER ═══ -->
      <div style="display:flex; border-top:2px solid #000; border-bottom:2px solid #000; background:#f0f0f0; padding:15px; margin-top:15px;">
        <div style="width:50%;"></div>
        <div style="width:50%; padding-left:20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
            <span>TRANSACTION TYPE:</span>
            <span>CREDIT</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
            <span>AMOUNT COLLECTED:</span>
            <span>₹${totalWithGst}</span>
          </div>
        </div>
      </div>

      <!-- ═══ FOOTER ═══ -->
      <div style="margin-top:auto; background:#6b3f36; color:#fff; display:flex; justify-content:space-between; padding:15px 20px; font-size:12px;">
        <div style="width:40%;">
          <div style="font-weight:bold; margin-bottom:6px; font-size:14px;">REACH US AT</div>
          <div>✉ info@utpalaayurdhama.com</div>
          <div>📞 +91-7259195959</div>
          <div>📞 080-4054-0333</div>
        </div>
        <div style="width:2px; background:rgba(255,255,255,0.5); margin:0 15px;"></div>
        <div style="width:55%;">
          <div style="font-weight:bold; margin-bottom:6px; font-size:14px;">OUR BRANCH(S)</div>
          <div>
            📍 RAJESHWARI AYURDHAMA<br>
            #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br>
            Near Hesaraghatta Main Road, Bengaluru – 560073<br>
            ✉ rajeshwariayurdhama@gmail.com
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Give browser a chance to render images
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let positionY = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, positionY, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if needed (for long invoices)
    while (heightLeft > 0) {
      positionY = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, positionY, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Tax_Invoice_${(invoice.no || "receipt").replace(/[\/\\]/g, "-")}.pdf`);

    toast.success("Invoice downloaded successfully");

  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF");
  }
};