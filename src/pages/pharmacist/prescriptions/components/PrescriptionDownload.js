
// // // // import axios from "axios";
// // // // import { getApiUrl, getAuthHeaders } from "../../../../config/api";
// // // // import html2canvas from "html2canvas";
// // // // import jsPDF from "jspdf";
// // // // import { toast } from "react-toastify";
// // // // import logo from "../../../../assets/logo/logo2.png";

// // // // // Simple number to words (you can improve later)
// // // // const numberToWords = (num) => {
// // // //   const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
// // // //     "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
// // // //   const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
// // // //   const hundreds = ["", "One Hundred", "Two Hundred", "Three Hundred", "Four Hundred", "Five Hundred",
// // // //     "Six Hundred", "Seven Hundred", "Eight Hundred", "Nine Hundred"];
// // // //   if (num === 0) return "Zero";
// // // //   if (num < 20) return ones[num];
// // // //   if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
// // // //   if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 ? " " + numberToWords(num % 100) : "");
// // // //   return num.toString(); // fallback
// // // // };

// // // // export const handleDownload = async (id) => {
// // // //   try {
// // // //     const response = await axios.get(
// // // //       getApiUrl(`examinations/user-last-prescription/${id}`),
// // // //       { headers: getAuthHeaders() }
// // // //     );
// // // //     const data = response.data?.data;
// // // //     if (!data) {
// // // //       toast.error("No prescription data found");
// // // //       return;
// // // //     }

// // // //     // Patient & Invoice data
// // // //     const patient = {
// // // //       name: data.patientName || "MRS. SUPRITA SHETTY",
// // // //       gender: data.gender || "Female",
// // // //       age: data.age || "",
// // // //       mobileOrUHID: data.mobile || "",
// // // //       email: data.email || "",
// // // //       gstin: data.patientGSTIN || ""
// // // //     };

// // // //     const invoice = {
// // // //       no: data.invoiceNo || "S/25-26/135",
// // // //       date: data.invoiceDate || new Date().toLocaleDateString("en-IN"),
// // // //       doctor: data.doctorName || "Dr. Rajeshwari"
// // // //     };

// // // //     // Medicines (filtered columns)
// // // //     const items = data.medicines || [];
// // // // const medicinesRows = items.map((m, i) => {
// // // //   const qty = Number(m.quantity || 1);
// // // //   const rate = Number(m.rate || m.price || 0);
// // // //   const total = qty * rate;

// // // //   return `
// // // //     <tr>
// // // //       <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
// // // //       <td style="border:1px solid #000; padding:5px; font-size:11px;">${m.medicineName || m.itemName || ""}</td>
// // // //       <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${qty}</td>
// // // //       <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${rate.toFixed(2)}</td>
// // // //       <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${total.toFixed(2)}</td>
// // // //     </tr>
// // // //   `;
// // // // }).join("");

// // // //     const subtotal = Number(data.subtotal || data.amount || 0).toFixed(2);
// // // //    const totalWithGst = Number(data.totalWithGst || data.total || 0).toFixed(2);
// // // //     const amountInWords = `Rs. ${numberToWords(Math.round(totalWithGst))} Only`;

// // // //     // ── Container with single border line (changed from 2px to 1px) ──
// // // //     const container = document.createElement("div");
// // // //     container.style.position = "absolute";
// // // //     container.style.left = "-9999px";
// // // //     container.style.top = "0";
// // // //     container.style.width = "794px";
// // // //     container.style.minHeight = "1123px";
// // // //     container.style.padding = "20px 15px";
// // // //     container.style.border = "1px solid #000"; // ✅ changed from 2px to 1px
// // // //     container.style.boxSizing = "border-box";
// // // //     container.style.fontFamily = "Arial, Helvetica, sans-serif";
// // // //     container.style.fontSize = "12px";
// // // //     container.style.color = "#000";
// // // //     container.style.backgroundColor = "#fff";
// // // //     container.style.position = "relative";

// // // //     container.innerHTML = `
// // // //       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

// // // //       <!-- HEADER -->
// // // //       <div style="background:#fff3e0; padding:12px; text-align:center;  margin-bottom:15px;">
// // // //         <!-- LOGO -->
// // // //         <div style="display:flex; justify-content:center; align-items:center;">
// // // //           <img src="${logo}" style="height:90px; object-fit:contain;" alt="Utpala Ayurdham Logo" />
// // // //         </div>

// // // //         <!-- TITLE -->
// // // //         <div style="font-size:24px; font-weight:bold; color:#000; margin:6px 0;">
// // // //           Utpala Ayurdhama
// // // //         </div>

// // // //         <!-- ADDRESS -->
// // // //         <div style="font-size:11px; line-height:1.4;">
// // // //           New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
// // // //           R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
// // // //         </div>
// // // //       </div>

// // // //       <!-- PATIENT + INVOICE INFO -->
// // // //       <div style="display:flex; border:1px solid #000; margin-bottom:15px;">
// // // //         <div style="width:65%; background:#f8f8f8; padding:12px; border-right:1px solid #000;">
// // // //           <table style="width:100%; font-size:13px;">
// // // //             <tr><td style="font-weight:bold; width:140px;">NAME</td><td>:</td><td>${patient.name}</td></tr>
// // // //             <tr><td style="font-weight:bold;">AGE</td><td>:</td><td>${patient.age}</td></tr>
// // // //             <tr><td style="font-weight:bold;">GENDER</td><td>:</td><td>${patient.gender}</td></tr>
// // // //             <tr><td style="font-weight:bold;">PHONE</td><td>:</td><td>${patient.mobileOrUHID}</td></tr>
// // // //           </table>
// // // //         </div>
// // // //         <div style="width:35%; background:#f8f8f8; padding:12px;">
// // // //           <div style="text-align:center; font-weight:bold; font-size:18px; border-bottom:1px solid #000; padding:8px;">INVOICE DETAILS</div>
// // // //           <table style="width:100%; margin-top:8px; font-size:13px;">
// // // //             <tr><td style="font-weight:bold;">No:</td><td>${invoice.no}</td></tr>
// // // //             <tr><td style="font-weight:bold;">Date:</td><td>${invoice.date}</td></tr>
// // // //             <tr><td style="font-weight:bold;">Time:</td><td>${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td></tr>
// // // //           </table>
// // // //         </div>
// // // //       </div>

// // // //       <!-- ITEMS TABLE (reduced columns) -->
// // // //       <table style="width:100%; border-collapse:collapse; margin:15px 0; font-size:11px;">
// // // //         <thead>
// // // //           <tr style="background:#f5f5f5;">
// // // //             <th style="border:1px solid #000; padding:6px; width:40px;">Srl</th>
// // // //             <th style="border:1px solid #000; padding:6px;">Item Name</th>
// // // //             <th style="border:1px solid #000; padding:6px; width:70px;">Qty</th>
// // // //             <th style="border:1px solid #000; padding:6px; width:90px;">Rate</th>
// // // //             <th style="border:1px solid #000; padding:6px; width:90px;">Total</th>
// // // //           </tr>
// // // //         </thead>
// // // //         <tbody>
// // // //           ${medicinesRows}
// // // //           <tr style="font-weight:bold; background:#f0f0f0;">
// // // //             <td colspan="2" style="border:1px solid #000; padding:6px;">TOTAL</td>
// // // //             <td style="text-align:center; border:1px solid #000; padding:6px;">${items.reduce((sum, m) => sum + Number(m.quantity || 1), 0)}</td>
// // // //             <td style="border:1px solid #000; padding:6px;"></td>
// // // //             <td style="text-align:right; border:1px solid #000; padding:6px;">${subtotal}</td>
// // // //           </tr>
// // // //         </tbody>
// // // //       </table>

// // // //       <!-- SUMMARY -->
// // // //       <div style="display:flex; border:1px solid #000; padding:15px; background:#f8f8f8; margin:15px 0;">
// // // //         <div style="width:60%;">
// // // //           <div style="font-weight:bold; margin-bottom:6px;">Amount in Words:</div>
// // // //           <div style="font-style:italic; font-size:12px;">${amountInWords}</div>
// // // //         </div>
// // // //         <div style="width:40%; text-align:right;">
// // // //           <div style="margin-bottom:8px;">
// // // //             <strong>Sub Total:</strong> ₹${subtotal}
// // // //           </div>
// // // //           <div style="font-size:14px; font-weight:bold; border-top:1px solid #000; padding-top:8px;">
// // // //             <strong>Total:</strong> ₹${totalWithGst}
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       <!-- FIXED FOOTER -->
// // // //       <div style="
// // // //         position: absolute;
// // // //         bottom: 10px;
// // // //         left: 10px;
// // // //         right: 10px;
// // // //         background:#6b3f36;
// // // //         color:#fff;
// // // //         display:flex;
// // // //         justify-content:space-between;
// // // //         padding:12px 20px;
// // // //         font-size:11px;
// // // //         border-top:1px solid #000;
// // // //       ">
// // // //         <div style="width:45%;">
// // // //           <div style="font-weight:bold; margin-bottom:5px; font-size:12px;">REACH US AT</div>
// // // //           <div><i class="fa-solid fa-envelope" style="margin-right:6px;"></i> info@utpalaayurdhama.com</div>
// // // //           <div><i class="fa-solid fa-phone" style="margin-right:6px;"></i> +91-7259195959</div>
// // // //           <div><i class="fa-solid fa-phone-volume" style="margin-right:6px;"></i> 080-4054-0333</div>
// // // //         </div>
// // // //         <div style="width:50%; text-align:right;">
// // // //           <div style="font-weight:bold; margin-bottom:5px; font-size:12px;">OUR BRANCH</div>
// // // //           <div>
// // // //             <i class="fa-solid fa-location-dot" style="margin-right:6px;"></i> RAJESHWARI AYURDHAMA<br>
// // // //             #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br>
// // // //             Near Hesaraghatta Main Road, Bengaluru – 560073<br>
// // // //             <i class="fa-solid fa-envelope" style="margin-right:6px;"></i> rajeshwariayurdhama@gmail.com
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     `;

// // // //     document.body.appendChild(container);

// // // //     // Wait for fonts & logo
// // // //     await new Promise(resolve => setTimeout(resolve, 800));

// // // //     const canvas = await html2canvas(container, {
// // // //       scale: 2.5,
// // // //       useCORS: true,
// // // //       logging: false,
// // // //       backgroundColor: "#ffffff",
// // // //       height: container.scrollHeight,
// // // //       windowHeight: container.scrollHeight
// // // //     });

// // // //     document.body.removeChild(container);

// // // //     const pdf = new jsPDF({
// // // //       orientation: "portrait",
// // // //       unit: "mm",
// // // //       format: "a4",
// // // //       compress: true,
// // // //     });

// // // //     const pdfWidth = pdf.internal.pageSize.getWidth();
// // // //     const pdfHeight = pdf.internal.pageSize.getHeight();
// // // //     const imgWidth = pdfWidth;
// // // //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

// // // //     pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

// // // //     // Multi-page support
// // // //     let heightLeft = imgHeight - pdfHeight;
// // // //     let position = -pdfHeight;
// // // //     while (heightLeft > 0) {
// // // //       pdf.addPage();
// // // //       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
// // // //       heightLeft -= pdfHeight;
// // // //       position -= pdfHeight;
// // // //     }

// // // //     pdf.save(`Invoice_${invoice.no.replace(/[\/\\]/g, "-")}.pdf`);
// // // //     toast.success("Invoice downloaded successfully");

// // // //   } catch (error) {
// // // //     console.error("PDF generation failed:", error);
// // // //     toast.error("Failed to generate PDF");
// // // //   }
// // // // };

// // // import axios from "axios";
// // // import { getApiUrl, getAuthHeaders } from "../../../../config/api";
// // // import html2canvas from "html2canvas";
// // // import jsPDF from "jspdf";
// // // import { toast } from "react-toastify";
// // // import logo from "../../../../assets/logo/logo2.png";

// // // // Improved number to words (supports up to crores, better for Indian rupees)
// // // const numberToWords = (num) => {
// // //   if (num === 0) return "Zero";

// // //   const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
// // //     "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
// // //   const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
// // //   const scales = ["", "Thousand", "Lakh", "Crore"];

// // //   let str = "";
// // //   let i = 0;

// // //   num = Math.round(num);

// // //   while (num > 0) {
// // //     const part = num % 1000;
// // //     if (part > 0) {
// // //       let partStr = "";
// // //       const hundreds = Math.floor(part / 100);
// // //       const remainder = part % 100;

// // //       if (hundreds > 0) partStr += ones[hundreds] + " Hundred ";
// // //       if (remainder > 0) {
// // //         if (remainder < 20) partStr += ones[remainder];
// // //         else partStr += tens[Math.floor(remainder / 10)] + (remainder % 10 ? " " + ones[remainder % 10] : "");
// // //       }
// // //       str = partStr.trim() + (scales[i] ? " " + scales[i] : "") + (str ? " " + str : "");
// // //     }
// // //     num = Math.floor(num / 1000);
// // //     i++;
// // //   }

// // //   return str.trim() || "Zero";
// // // };

// // // export const handleDownload = async (id) => {
// // //   try {
// // //     const response = await axios.get(
// // //       getApiUrl(`examinations/user-last-prescription/${id}`),
// // //       { headers: getAuthHeaders() }
// // //     );

// // //     const data = response.data?.data;
// // //     if (!data) {
// // //       toast.error("No prescription / invoice data found");
// // //       return;
// // //     }

// // //     // ── Patient Info ────────────────────────────────────────
// // //     const patient = {
// // //       name: data.patientName || "MRS. SUPRITA SHETTY",
// // //       gender: data.gender || "Female",
// // //       age: data.age || "",
// // //       mobile: data.mobile || data.phone || "",
// // //       email: data.email || "",
// // //       uhid: data.uhid || "",
// // //     };

// // //     // ── Invoice / Doctor Info ────────────────────────────────────────
// // //     const invoice = {
// // //       no: data.invoiceNo || data.billNo || "S/25-26/135",
// // //       date: data.invoiceDate || data.billDate || new Date().toLocaleDateString("en-IN"),
// // //       doctor: data.doctorName || "Dr. Rajeshwari",
// // //       time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
// // //     };

// // //     // ── Financials – improved priority & fallback ───────────────────────────────
// // //     const subtotal    = Number(data.subtotal || data.amount || data.baseAmount || 0);
// // //     const discount    = Number(data.discount || data.discountAmount || 0);
// // //     const cgst        = Number(data.cgst || data.CGST || 0);
// // //     const sgst        = Number(data.sgst || data.SGST || 0);
// // //     const igst        = Number(data.igst || data.IGST || 0);
// // //     const taxAmount   = cgst + sgst + igst;
// // //     const grandTotal  = Number(data.grandTotal || data.totalWithGst || data.total || data.finalAmount || (subtotal - discount + taxAmount));

// // //     const subtotalStr    = subtotal.toFixed(2);
// // //     const discountStr    = discount.toFixed(2);
// // //     const taxStr         = taxAmount.toFixed(2);
// // //     const grandTotalStr  = grandTotal.toFixed(2);

// // //     const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;

// // //     // ── Medicines Table Rows ────────────────────────────────────────
// // //     const items = data.medicines || data.items || [];
// // //     const medicinesRows = items.map((m, i) => {
// // //       const qty   = Number(m.quantity || m.qty || 1);
// // //       const rate  = Number(m.rate || m.price || m.unitPrice || 0);
// // //       const total = qty * rate;

// // //       return `
// // //         <tr>
// // //           <td style="text-align:center; border:1px solid #000; padding:6px; font-size:11px;">${i + 1}</td>
// // //           <td style="border:1px solid #000; padding:6px; font-size:11px;">${m.medicineName || m.itemName || m.name || ""}</td>
// // //           <td style="text-align:center; border:1px solid #000; padding:6px; font-size:11px;">${qty}</td>
// // //           <td style="text-align:right; border:1px solid #000; padding:6px; font-size:11px;">${rate.toFixed(2)}</td>
// // //           <td style="text-align:right; border:1px solid #000; padding:6px; font-size:11px;">${total.toFixed(2)}</td>
// // //         </tr>
// // //       `;
// // //     }).join("");

// // //     const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || m.qty || 1), 0);

// // //     // ── HTML Container ──────────────────────────────────────────────
// // //     const container = document.createElement("div");
// // //     container.style.position = "absolute";
// // //     container.style.left = "-9999px";
// // //     container.style.width = "794px";           // A4 @ 96dpi ≈ 794px
// // //     container.style.minHeight = "1123px";
// // //     container.style.padding = "20px 18px";
// // //     container.style.border = "1px solid #000";
// // //     container.style.boxSizing = "border-box";
// // //     container.style.fontFamily = "Arial, Helvetica, sans-serif";
// // //     container.style.fontSize = "12px";
// // //     container.style.color = "#000";
// // //     container.style.background = "#fff";

// // //     container.innerHTML = `
// // //       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

// // //       <!-- Header -->
// // //       <div style="background:#fff3e0; padding:14px; text-align:center; margin-bottom:16px; border-bottom:2px solid #d4a373;">
// // //         <img src="${logo}" style="height:85px; object-fit:contain;" alt="Utpala Ayurdham" />
// // //         <div style="font-size:26px; font-weight:bold; margin:8px 0; color:#4a2c1f;">Utpala Ayurdhama</div>
// // //         <div style="font-size:11px; line-height:1.5;">
// // //           New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
// // //           R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
// // //         </div>
// // //       </div>

// // //       <!-- Patient + Invoice -->
// // //       <div style="display:flex; border:1px solid #000; margin-bottom:16px; font-size:13px;">
// // //         <div style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000;">
// // //           <table style="width:100%;">
// // //             <tr><td style="font-weight:bold; width:110px;">Patient Name</td><td>:</td><td>${patient.name}</td></tr>
// // //             <tr><td style="font-weight:bold;">Age / Gender</td><td>:</td><td>${patient.age} / ${patient.gender}</td></tr>
// // //             <tr><td style="font-weight:bold;">Mobile</td><td>:</td><td>${patient.mobile}</td></tr>
// // //             ${patient.uhid ? `<tr><td style="font-weight:bold;">UHID</td><td>:</td><td>${patient.uhid}</td></tr>` : ""}
// // //           </table>
// // //         </div>
// // //         <div style="width:35%; background:#f9f5f0; padding:12px;">
// // //           <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
// // //             INVOICE
// // //           </div>
// // //           <table style="width:100%;">
// // //             <tr><td style="font-weight:bold; width:70px;">No:</td><td>${invoice.no}</td></tr>
// // //             <tr><td style="font-weight:bold;">Date:</td><td>${invoice.date}</td></tr>
// // //             <tr><td style="font-weight:bold;">Time:</td><td>${invoice.time}</td></tr>
// // //             <tr><td style="font-weight:bold;">Doctor:</td><td>${invoice.doctor}</td></tr>
// // //           </table>
// // //         </div>
// // //       </div>

// // //       <!-- Items Table -->
// // //       <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
// // //         <thead>
// // //           <tr style="background:#f0e8df;">
// // //             <th style="border:1px solid #000; padding:7px; width:45px;">S.No</th>
// // //             <th style="border:1px solid #000; padding:7px;">Medicine / Item Name</th>
// // //             <th style="border:1px solid #000; padding:7px; width:60px;">Qty</th>
// // //             <th style="border:1px solid #000; padding:7px; width:85px;">Rate (₹)</th>
// // //             <th style="border:1px solid #000; padding:7px; width:85px;">Amount (₹)</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           ${medicinesRows}
// // //           <tr style="font-weight:bold; background:#f5f2ed;">
// // //             <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">TOTAL</td>
// // //             <td style="border:1px solid #000; padding:7px; text-align:center;">${totalQty}</td>
// // //             <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">₹${subtotalStr}</td>
// // //           </tr>
// // //         </tbody>
// // //       </table>

// // //       <!-- Summary -->
// // //       <div style="border:1px solid #000; padding:16px; background:#f9f5f0; margin:16px 0; font-size:13px;">
// // //         <div style="display:flex; justify-content:space-between;">
// // //           <div style="width:58%;">
// // //             <div style="font-weight:bold; margin-bottom:8px;">Amount (in words):</div>
// // //             <div style="font-style:italic; line-height:1.4;">${amountInWords}</div>
// // //           </div>
// // //           <div style="width:40%; text-align:right;">
// // //             <div><strong>Subtotal:</strong> ₹${subtotalStr}</div>
// // //             ${discount > 0 ? `<div style="color:#c62828;"><strong>Discount:</strong> -₹${discountStr}</div>` : ""}
// // //             ${taxAmount > 0 ? `
// // //               <div style="margin:6px 0;">
// // //                 <strong>Tax (GST):</strong> ₹${taxStr}
// // //               </div>
// // //             ` : ""}
// // //             <div style="font-size:15px; font-weight:bold; border-top:2px solid #000; padding-top:10px; margin-top:10px;">
// // //               Grand Total: ₹${grandTotalStr}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <!-- Footer -->
// // //       <div style="
// // //         position: absolute;
// // //         bottom: 12px;
// // //         left: 18px;
// // //         right: 18px;
// // //         background:#5d4037;
// // //         color:#fff;
// // //         padding:14px 20px;
// // //         font-size:11px;
// // //         display:flex;
// // //         justify-content:space-between;
// // //         border-top:1px solid #8d6e63;
// // //       ">
// // //         <div style="width:48%;">
// // //           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">REACH US</div>
// // //           <div><i class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>
// // //           <div><i class="fa-solid fa-phone"></i> +91-7259195959</div>
// // //           <div><i class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
// // //         </div>
// // //         <div style="width:50%; text-align:right;">
// // //           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">BRANCH</div>
// // //           <div>
// // //             <i class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br/>
// // //             #607, Ravi Nenapu, 7th Main, Havanur Extn,<br/>
// // //             Near Hesaraghatta Main Rd, Bengaluru – 560073<br/>
// // //             <i class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
// // //           </div>
// // //         </div>
// // //       </div>
// // //     `;

// // //     document.body.appendChild(container);

// // //     // Give time for images/fonts to load
// // //     await new Promise(r => setTimeout(r, 1000));

// // //     const canvas = await html2canvas(container, {
// // //       scale: 2.8,
// // //       useCORS: true,
// // //       logging: false,
// // //       backgroundColor: "#ffffff",
// // //       height: container.scrollHeight,
// // //       windowHeight: container.scrollHeight,
// // //       allowTaint: true,
// // //     });

// // //     document.body.removeChild(container);

// // //     const pdf = new jsPDF({
// // //       orientation: "portrait",
// // //       unit: "mm",
// // //       format: "a4",
// // //       compress: true,
// // //     });

// // //     const pdfWidth = pdf.internal.pageSize.getWidth();
// // //     const pdfHeight = pdf.internal.pageSize.getHeight();
// // //     const imgWidth = pdfWidth;
// // //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

// // //     pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

// // //     // Handle multi-page content
// // //     let heightLeft = imgHeight - pdfHeight;
// // //     let position = -pdfHeight;
// // //     while (heightLeft > 0) {
// // //       pdf.addPage();
// // //       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
// // //       heightLeft -= pdfHeight;
// // //       position -= pdfHeight;
// // //     }

// // //     pdf.save(`Invoice_${invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
// // //     toast.success("Invoice downloaded successfully!");

// // //   } catch (err) {
// // //     console.error("PDF generation error:", err);
// // //     toast.error("Failed to generate invoice PDF");
// // //   }
// // // };

// // import axios from "axios";
// // import { getApiUrl, getAuthHeaders } from "../../../../config/api";
// // import html2canvas from "html2canvas";
// // import jsPDF from "jspdf";
// // import { toast } from "react-toastify";
// // import logo from "../../../../assets/logo/logo2.png";

// // // Improved numberToWords for Indian Rupees (handles up to crores)
// // const numberToWords = (num) => {
// //   if (num === 0) return "Zero";

// //   const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
// //     "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
// //   const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
// //   const scales = ["", "Thousand", "Lakh", "Crore"];

// //   let str = "";
// //   let i = 0;
// //   num = Math.round(num);

// //   while (num > 0) {
// //     const part = num % 1000;
// //     if (part > 0) {
// //       let partStr = "";
// //       const hundreds = Math.floor(part / 100);
// //       const remainder = part % 100;

// //       if (hundreds > 0) partStr += ones[hundreds] + " Hundred ";
// //       if (remainder > 0) {
// //         if (remainder < 20) partStr += ones[remainder];
// //         else partStr += tens[Math.floor(remainder / 10)] + (remainder % 10 ? " " + ones[remainder % 10] : "");
// //       }
// //       str = partStr.trim() + (scales[i] ? " " + scales[i] : "") + (str ? " " + str : "");
// //     }
// //     num = Math.floor(num / 1000);
// //     i++;
// //   }

// //   return str.trim() || "Zero";
// // };

// // export const handleDownload = async (id) => {
// //   try {
// //     const response = await axios.get(
// //       getApiUrl(`examinations/user-last-prescription/${id}`),
// //       { headers: getAuthHeaders() }
// //     );

// //     const data = response.data?.data;
// //     if (!data) {
// //       toast.error("No invoice / prescription data found");
// //       return;
// //     }

// //     // Patient information
// //     const patient = {
// //       name: data.patientName || data.name || "MRS. SUPRITA SHETTY",
// //       gender: data.gender || "Female",
// //       age: data.age || data.patientAge || "",
// //       mobile: data.mobile || data.phone || "",
// //       email: data.email || "",
// //       uhid: data.uhid || data.patientId || "",
// //     };

// //     // Invoice / document info
// //     const invoice = {
// //       no: data.invoiceNo || data.billNo || data.prescriptionNo || "S/25-26/135",
// //       date: data.invoiceDate || data.billDate || data.date || new Date().toLocaleDateString("en-IN"),
// //       doctor: data.doctorName || data.consultant || "Dr. Rajeshwari",
// //       time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
// //     };

// //     // ── Financial calculations with smart fallbacks ───────────────────────────────
// //     const subtotal   = Number(data.subtotal || data.baseAmount || data.amount || data.totalAmount || 0);
// //     const discount   = Number(data.discount || data.discountAmount || data.discountValue || 0);
// //     const cgst       = Number(data.cgst || data.CGST || data.cgstAmount || 0);
// //     const sgst       = Number(data.sgst || data.SGST || data.sgstAmount || 0);
// //     const igst       = Number(data.igst || data.IGST || data.igstAmount || 0);

// //     const totalGst   = cgst + sgst + igst;
// //     // Final grand total – try multiple common field names or calculate
// //     const grandTotal = Number(
// //       data.grandTotal ||
// //       data.totalWithGst ||
// //       data.total ||
// //       data.finalAmount ||
// //       data.grandTotalAmount ||
// //       (subtotal - discount + totalGst)
// //     );

// //     const subtotalStr   = subtotal.toFixed(2);
// //     const discountStr   = discount.toFixed(2);
// //     const totalGstStr   = totalGst.toFixed(2);
// //     const grandTotalStr = grandTotal.toFixed(2);

// //     const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;

// //     const gstStatusText = totalGst > 0
// //       ? "This invoice includes GST as per applicable rates"
// //       : "GST not applicable / GST exempt invoice";

// //     // ── Medicine / Item rows ────────────────────────────────────────────────
// //     const items = data.medicines || data.items || data.prescriptionItems || [];
// //     const medicinesRows = items.map((m, i) => {
// //       const qty   = Number(m.quantity || m.qty || 1);
// //       const rate  = Number(m.rate || m.price || m.unitPrice || m.mrp || 0);
// //       const total = qty * rate;

// //       return `
// //         <tr>
// //           <td style="text-align:center; border:1px solid #000; padding:6px; font-size:11px;">${i + 1}</td>
// //           <td style="border:1px solid #000; padding:6px; font-size:11px;">${m.medicineName || m.itemName || m.name || m.productName || ""}</td>
// //           <td style="text-align:center; border:1px solid #000; padding:6px; font-size:11px;">${qty}</td>
// //           <td style="text-align:right; border:1px solid #000; padding:6px; font-size:11px;">${rate.toFixed(2)}</td>
// //           <td style="text-align:right; border:1px solid #000; padding:6px; font-size:11px;">${total.toFixed(2)}</td>
// //         </tr>
// //       `;
// //     }).join("");

// //     const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || m.qty || 1), 0);

// //     // ── HTML Container for PDF ──────────────────────────────────────────────
// //     const container = document.createElement("div");
// //     container.style.position = "absolute";
// //     container.style.left = "-9999px";
// //     container.style.width = "794px"; // A4 at 96dpi
// //     container.style.minHeight = "1123px";
// //     container.style.padding = "20px 18px";
// //     container.style.border = "1px solid #000";
// //     container.style.boxSizing = "border-box";
// //     container.style.fontFamily = "Arial, Helvetica, sans-serif";
// //     container.style.fontSize = "12px";
// //     container.style.color = "#000";
// //     container.style.background = "#fff";

// //     container.innerHTML = `
// //       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

// //       <!-- Header -->
// //       <div style="background:#fff3e0; padding:14px; text-align:center; margin-bottom:16px; border-bottom:2px solid #d4a373;">
// //         <img src="${logo}" style="height:85px; object-fit:contain;" alt="Utpala Ayurdhama" />
// //         <div style="font-size:26px; font-weight:bold; margin:8px 0; color:#4a2c1f;">Utpala Ayurdhama</div>
// //         <div style="font-size:11px; line-height:1.5;">
// //           New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
// //           R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
// //         </div>
// //       </div>

// //       <!-- Patient + Invoice Info -->
// //       <div style="display:flex; border:1px solid #000; margin-bottom:16px; font-size:13px;">
// //         <div style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000;">
// //           <table style="width:100%;">
// //             <tr><td style="font-weight:bold; width:110px;">Patient Name</td><td>:</td><td>${patient.name}</td></tr>
// //             <tr><td style="font-weight:bold;">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
// //             <tr><td style="font-weight:bold;">Mobile</td><td>:</td><td>${patient.mobile}</td></tr>
// //             ${patient.uhid ? `<tr><td style="font-weight:bold;">UHID</td><td>:</td><td>${patient.uhid}</td></tr>` : ""}
// //           </table>
// //         </div>
// //         <div style="width:35%; background:#f9f5f0; padding:12px;">
// //           <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
// //             INVOICE
// //           </div>
// //           <table style="width:100%;">
// //             <tr><td style="font-weight:bold; width:70px;">No:</td><td>${invoice.no}</td></tr>
// //             <tr><td style="font-weight:bold;">Date:</td><td>${invoice.date}</td></tr>
// //             <tr><td style="font-weight:bold;">Time:</td><td>${invoice.time}</td></tr>
// //             <tr><td style="font-weight:bold;">Doctor:</td><td>${invoice.doctor}</td></tr>
// //           </table>
// //         </div>
// //       </div>

// //       <!-- Items Table -->
// //       <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
// //         <thead>
// //           <tr style="background:#f0e8df;">
// //             <th style="border:1px solid #000; padding:7px; width:45px;">S.No</th>
// //             <th style="border:1px solid #000; padding:7px;">Medicine / Item Name</th>
// //             <th style="border:1px solid #000; padding:7px; width:60px;">Qty</th>
// //             <th style="border:1px solid #000; padding:7px; width:85px;">Rate (₹)</th>
// //             <th style="border:1px solid #000; padding:7px; width:85px;">Amount (₹)</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           ${medicinesRows}
// //           <tr style="font-weight:bold; background:#f5f2ed;">
// //             <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">TOTAL</td>
// //             <td style="border:1px solid #000; padding:7px; text-align:center;">${totalQty}</td>
// //             <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">₹${subtotalStr}</td>
// //           </tr>
// //         </tbody>
// //       </table>

// //       <!-- Summary with GST -->
// //       <div style="border:1px solid #000; padding:16px; background:#f9f5f0; margin:16px 0 24px 0; font-size:13px;">
// //         <div style="display:flex; justify-content:space-between; align-items:flex-start;">
// //           <div style="width:55%;">
// //             <div style="font-weight:bold; margin-bottom:8px; font-size:13px;">Amount (in words):</div>
// //             <div style="font-style:italic; line-height:1.45; font-size:12.5px;">${amountInWords}</div>
// //           </div>
// //           <div style="width:43%; text-align:right; line-height:1.6;">
// //             <div><strong>Subtotal:</strong> ₹${subtotalStr}</div>
// //             ${discount > 0 ? `<div style="color:#c62828;"><strong>Discount:</strong> -₹${discountStr}</div>` : ''}
// //             ${totalGst > 0 ? `<div style="margin:5px 0; font-weight:600;"><strong>Total GST:</strong> ₹${totalGstStr}</div>` : ''}
// //             <div style="font-size:15px; font-weight:bold; border-top:2px solid #4a2c1f; padding-top:10px; margin-top:8px;">
// //               Grand Total: ₹${grandTotalStr}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <!-- GST status note -->
// //       <div style="font-size:11px; text-align:center; color:#555; margin:0 0 60px 0; font-style:italic;">
// //         ${gstStatusText}
// //       </div>

// //       <!-- Footer -->
// //       <div style="
// //         position: absolute;
// //         bottom: 12px;
// //         left: 18px;
// //         right: 18px;
// //         background:#5d4037;
// //         color:#fff;
// //         padding:14px 20px;
// //         font-size:11px;
// //         display:flex;
// //         justify-content:space-between;
// //         border-top:1px solid #8d6e63;
// //       ">
// //         <div style="width:48%;">
// //           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">REACH US</div>
// //           <div><i class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>
// //           <div><i class="fa-solid fa-phone"></i> +91-7259195959</div>
// //           <div><i class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
// //         </div>
// //         <div style="width:50%; text-align:right;">
// //           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">BRANCH</div>
// //           <div>
// //             <i class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br/>
// //             #607, Ravi Nenapu, 7th Main, Havanur Extn,<br/>
// //             Near Hesaraghatta Main Rd, Bengaluru – 560073<br/>
// //             <i class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
// //           </div>
// //         </div>
// //       </div>
// //     `;

// //     document.body.appendChild(container);

// //     // Wait for logo & fonts
// //     await new Promise(r => setTimeout(r, 1000));

// //     const canvas = await html2canvas(container, {
// //       scale: 2.8,
// //       useCORS: true,
// //       logging: false,
// //       backgroundColor: "#ffffff",
// //       height: container.scrollHeight,
// //       windowHeight: container.scrollHeight,
// //       allowTaint: true,
// //     });

// //     document.body.removeChild(container);

// //     const pdf = new jsPDF({
// //       orientation: "portrait",
// //       unit: "mm",
// //       format: "a4",
// //       compress: true,
// //     });

// //     const pdfWidth = pdf.internal.pageSize.getWidth();
// //     const pdfHeight = pdf.internal.pageSize.getHeight();
// //     const imgWidth = pdfWidth;
// //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

// //     pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

// //     // Multi-page handling
// //     let heightLeft = imgHeight - pdfHeight;
// //     let position = -pdfHeight;
// //     while (heightLeft > 0) {
// //       pdf.addPage();
// //       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
// //       heightLeft -= pdfHeight;
// //       position -= pdfHeight;
// //     }

// //     pdf.save(`Invoice_${invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
// //     toast.success("Invoice downloaded successfully");

// //   } catch (err) {
// //     console.error("PDF generation failed:", err);
// //     toast.error("Failed to generate invoice PDF");
// //   }
// // };

// import axios from "axios";
// import { getApiUrl, getAuthHeaders } from "../../../../config/api";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { toast } from "react-toastify";
// import logo from "../../../../assets/logo/logo2.png";

// // Number to words (Indian style)
// const numberToWords = (num) => {
//   if (num === 0) return "Zero";

//   const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
//     "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//   const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
//   const scales = ["", "Thousand", "Lakh", "Crore"];

//   let str = "";
//   let i = 0;
//   num = Math.round(num);

//   while (num > 0) {
//     const part = num % 1000;
//     if (part > 0) {
//       let partStr = "";
//       const hundreds = Math.floor(part / 100);
//       const remainder = part % 100;

//       if (hundreds > 0) partStr += ones[hundreds] + " Hundred ";
//       if (remainder > 0) {
//         if (remainder < 20) partStr += ones[remainder];
//         else partStr += tens[Math.floor(remainder / 10)] + (remainder % 10 ? " " + ones[remainder % 10] : "");
//       }
//       str = partStr.trim() + (scales[i] ? " " + scales[i] : "") + (str ? " " + str : "");
//     }
//     num = Math.floor(num / 1000);
//     i++;
//   }
//   return str.trim() || "Zero";
// };

// export const handleDownload = async (id) => {
//   try {
//     const response = await axios.get(
//       getApiUrl(`examinations/user-last-prescription/${id}`),
//       { headers: getAuthHeaders() }
//     );

//     const data = response.data?.data;
//     if (!data) {
//       toast.error("No invoice data found");
//       return;
//     }

//     // Patient info
//     const patient = {
//       name: data.patientName || "MRS. SUPRITA SHETTY",
//       gender: data.gender || "Female",
//       age: data.age || "",
//       mobile: data.mobile || "",
//     };

//     // Invoice info
//     const invoice = {
//       no: data.invoiceNo || "S/25-26/135",
//       date: data.invoiceDate || new Date().toLocaleDateString("en-IN"),
//       doctor: data.doctorName || "Dr. Rajeshwari",
//       time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
//     };

//     // Financial calculations
//     const subtotal = Number(data.subtotal || data.amount || data.baseAmount || 0);
//     const cgst = Number(data.cgst || data.CGST || 0);
//     const sgst = Number(data.sgst || data.SGST || 0);
//     const igst = Number(data.igst || data.IGST || 0);
//     const totalGst = cgst + sgst + igst;
//     const grandTotal = Number(data.grandTotal || data.totalWithGst || data.total || (subtotal + totalGst));

//     const subtotalStr = subtotal.toFixed(2);
//     const totalGstStr = totalGst.toFixed(2);
//     const grandTotalStr = grandTotal.toFixed(2);

//     // GST rate display
//     let gstRateText = "";
//     if (totalGst > 0) {
//       // Try to get exact rate from data, fallback to calculated
//       gstRateText = data.gstRate || data.taxRate 
//         ? `${data.gstRate || data.taxRate}%`
//         : `${Math.round((totalGst / subtotal) * 200) / 2}%`;
//     }

//     const amountInWords = `Rupees ${numberToWords(grandTotal)} Only`;

//     // Items rows
//     const items = data.medicines || data.items || [];
//     const medicinesRows = items.map((m, i) => {
//       const qty = Number(m.quantity || 1);
//       const rate = Number(m.rate || m.price || 0);
//       const total = qty * rate;
//       return `
//         <tr>
//           <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${i + 1}</td>
//           <td style="border:1px solid #000; padding:5px; font-size:11px;">${m.medicineName || m.itemName || m.name || ""}</td>
//           <td style="text-align:center; border:1px solid #000; padding:5px; font-size:11px;">${qty}</td>
//           <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${rate.toFixed(2)}</td>
//           <td style="text-align:right; border:1px solid #000; padding:5px; font-size:11px;">${total.toFixed(2)}</td>
//         </tr>
//       `;
//     }).join("");

//     const totalQty = items.reduce((sum, m) => sum + Number(m.quantity || 1), 0);

//     // Container
//     const container = document.createElement("div");
//     container.style.position = "absolute";
//     container.style.left = "-9999px";
//     container.style.width = "794px";
//     container.style.minHeight = "1123px";
//     container.style.padding = "20px 18px";
//     container.style.border = "1px solid #000";
//     container.style.boxSizing = "border-box";
//     container.style.fontFamily = "Arial, Helvetica, sans-serif";
//     container.style.fontSize = "12px";
//     container.style.background = "#fff";

//     container.innerHTML = `
//       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />

//       <!-- Header -->
//       <div style="background:#fff3e0; padding:14px; text-align:center; margin-bottom:16px; border-bottom:2px solid #d4a373;">
//         <img src="${logo}" style="height:85px; object-fit:contain;" alt="Utpala Ayurdhama" />
//         <div style="font-size:26px; font-weight:bold; margin:8px 0; color:#4a2c1f;">Utpala Ayurdhama</div>
//         <div style="font-size:11px; line-height:1.5;">
//           New BEL Rd, Chikkamaranahalli, Dollars Colony,<br/>
//           R.M.V. 2nd Stage, Bengaluru, Karnataka 560094
//         </div>
//       </div>

//       <!-- Patient + Invoice -->
//       <div style="display:flex; border:1px solid #000; margin-bottom:16px; font-size:13px;">
//         <div style="width:65%; background:#f9f5f0; padding:12px; border-right:1px solid #000;">
//           <table style="width:100%;">
//             <tr><td style="font-weight:bold; width:110px;">Patient Name</td><td>:</td><td>${patient.name}</td></tr>
//             <tr><td style="font-weight:bold;">Age / Gender</td><td>:</td><td>${patient.age ? patient.age + ' / ' : ''}${patient.gender}</td></tr>
//             <tr><td style="font-weight:bold;">Mobile</td><td>:</td><td>${patient.mobile}</td></tr>
//           </table>
//         </div>
//         <div style="width:35%; background:#f9f5f0; padding:12px;">
//           <div style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:10px; border-bottom:1px solid #000; padding-bottom:6px;">
//             INVOICE
//           </div>
//           <table style="width:100%;">
//             <tr><td style="font-weight:bold; width:70px;">No:</td><td>${invoice.no}</td></tr>
//             <tr><td style="font-weight:bold;">Date:</td><td>${invoice.date}</td></tr>
//             <tr><td style="font-weight:bold;">Time:</td><td>${invoice.time}</td></tr>
//             <tr><td style="font-weight:bold;">Doctor:</td><td>${invoice.doctor}</td></tr>
//           </table>
//         </div>
//       </div>

//       <!-- Items + Summary Table -->
//       <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:11px;">
//         <thead>
//           <tr style="background:#f5f5f5;">
//             <th style="border:1px solid #000; padding:6px; width:45px;">Srl</th>
//             <th style="border:1px solid #000; padding:6px;">Item Name</th>
//             <th style="border:1px solid #000; padding:6px; width:60px;">Qty</th>
//             <th style="border:1px solid #000; padding:6px; width:85px;">Rate</th>
//             <th style="border:1px solid #000; padding:6px; width:85px;">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${medicinesRows}

//           <!-- Sub Total -->
//           <tr style="font-weight:bold; background:#f8f8f8;">
//             <td colspan="2" style="border:1px solid #000; padding:6px; text-align:right;">Sub Total</td>
//             <td style="border:1px solid #000; padding:6px; text-align:center;">${totalQty}</td>
//             <td style="border:1px solid #000; padding:6px;"></td>
//             <td style="text-align:right; border:1px solid #000; padding:6px;">₹${subtotalStr}</td>
//           </tr>

//           <!-- GST -->
//           ${totalGst > 0 ? `
//             <tr style="font-weight:bold; background:#f8f8f8;">
//               <td colspan="2" style="border:1px solid #000; padding:6px; text-align:right;">GST (${gstRateText})</td>
//               <td style="border:1px solid #000; padding:6px;"></td>
//               <td style="border:1px solid #000; padding:6px;"></td>
//               <td style="text-align:right; border:1px solid #000; padding:6px;">₹${totalGstStr}</td>
//             </tr>
//           ` : ''}

//           <!-- Total with GST -->
//           <tr style="font-weight:bold; background:#e0e0e0; font-size:12px;">
//             <td colspan="2" style="border:1px solid #000; padding:7px; text-align:right;">Total (with GST)</td>
//             <td style="border:1px solid #000; padding:7px;"></td>
//             <td style="border:1px solid #000; padding:7px;"></td>
//             <td style="text-align:right; border:1px solid #000; padding:7px;">₹${grandTotalStr}</td>
//           </tr>
//         </tbody>
//       </table>

//       <!-- Amount in Words -->
//       <div style="margin:16px 0; font-size:12px;">
//         <strong>Amount in Words:</strong><br/>
//         <em>${amountInWords}</em>
//       </div>

//       <!-- Footer -->
//       <div style="
//         position: absolute;
//         bottom: 12px;
//         left: 18px;
//         right: 18px;
//         background:#5d4037;
//         color:#fff;
//         padding:14px 20px;
//         font-size:11px;
//         display:flex;
//         justify-content:space-between;
//         border-top:1px solid #8d6e63;
//       ">
//         <div style="width:48%;">
//           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">REACH US</div>
//           <div><i class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>
//           <div><i class="fa-solid fa-phone"></i> +91-7259195959</div>
//           <div><i class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
//         </div>
//         <div style="width:50%; text-align:right;">
//           <div style="font-weight:bold; font-size:12px; margin-bottom:6px;">BRANCH</div>
//           <div>
//             <i class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br/>
//             #607, Ravi Nenapu, 7th Main, Havanur Extn,<br/>
//             Near Hesaraghatta Main Rd, Bengaluru – 560073<br/>
//             <i class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
//           </div>
//         </div>
//       </div>
//     `;

//     document.body.appendChild(container);

//     await new Promise(r => setTimeout(r, 1000));

//     const canvas = await html2canvas(container, {
//       scale: 2.8,
//       useCORS: true,
//       logging: false,
//       backgroundColor: "#ffffff",
//       height: container.scrollHeight,
//       windowHeight: container.scrollHeight,
//       allowTaint: true,
//     });

//     document.body.removeChild(container);

//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//       compress: true,
//     });

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();
//     const imgWidth = pdfWidth;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);

//     let heightLeft = imgHeight - pdfHeight;
//     let position = -pdfHeight;
//     while (heightLeft > 0) {
//       pdf.addPage();
//       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pdfHeight;
//       position -= pdfHeight;
//     }

//     pdf.save(`Invoice_${invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
//     toast.success("Invoice downloaded successfully");

//   } catch (err) {
//     console.error("PDF generation error:", err);
//     toast.error("Failed to generate invoice PDF");
//   }
// };

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