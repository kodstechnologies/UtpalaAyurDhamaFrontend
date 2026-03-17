

import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
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
  // For simplicity – add thousand/lakh logic if needed
  return num.toString();
};

export const handlePrint = async (id) => {
  try {
    const response = await axios.get(
      getApiUrl(`examinations/user-last-prescription/${id}`),
      { headers: getAuthHeaders() }
    );

    const data = response.data?.data;

    if (!data) {
      alert("No prescription data found");
      return;
    }

    // Map your API data fields (adjust names if different)
    const patient = {
      name: data.patientName || "MRS. SUPRITA SHETTY",
      gender: data.gender || "Female",
      age: data.age || "",
      address: data.address || "YESWANTHPUR",
      mobileOrUHID: data.uhid || "91842846456",
      gstin: data.patientGSTIN || "" // usually empty for patients
    };

    const invoice = {
      no: data.invoiceNo || "S/25-26/135",
      date: data.invoiceDate || "12/07/2025",
      referenceDate: data.referenceDate || "12/07/2025",
      doctor: data.doctorName || "Dr. Rajeshwari"
    };

    // Medicines – adapt your API structure
    const items = data.medicines || [];
    const medicinesRows = items.map((m, i) => `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td>${m.medicineName || m.itemName || "Sarasapilla Syrup"}</td>
        <td style="text-align:center;">${m.hsnCode || "32"}</td>
        <td style="text-align:center;">${m.quantity || "1.00"}</td>
        <td style="text-align:center;">${m.uom || "Nos"}</td>
        <td style="text-align:right;">${Number(m.rate || m.price || 360).toFixed(2)}</td>
        <td style="text-align:right;">${Number(m.amount || 360).toFixed(2)}</td>
        <td style="text-align:center;">${Number(m.gstPercent || 5).toFixed(2)}</td>
        <td style="text-align:right;">${Number(m.gstAmount || 17.14).toFixed(2)}</td>
        <td style="text-align:right;">${Number(m.total || 360).toFixed(2)}</td>
      </tr>
    `).join("");

    const subtotal = Number(data.subtotal || 342.86).toFixed(2);
    const gstAmount = Number(data.gstAmount || 17.14).toFixed(2);
    const totalWithGst = Number(data.totalWithGst || 360.00).toFixed(2);
    const cgst = (gstAmount / 2).toFixed(2);
    const sgst = cgst;

    const amountInWords = `Rs. ${numberToWords(Math.round(totalWithGst))} Only`;

    const html = `
    <html>
    <head>
      <title>Tax Invoice - Utpala Ayurdhama</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      <style>
     body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  margin: 10px auto;
  color: #000;
  border: 1px solid black;
  max-width: 50rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 297mm;
}
        .header {
          background: #fff3e0; /* light orange-beige like sample */
          padding: 10px;
          text-align: center;
          border-bottom: 2px solid #000;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #000000; /* saffron/orange tone */
          margin: 5px 0;
        }
        .clinic-info {
          font-size: 11px;
          margin: 5px 0;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin: 10px 0 5px;
        }
        table.info {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        table.info td {
          padding: 4px 6px;
          vertical-align: top;
          border: none;
        }
        table.items {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        table.items th, table.items td {
          border: 1px solid #000;
          padding: 5px;
          font-size: 11px;
        }
        table.items th {
          background: #f5f5f5;
          text-align: center;
        }
        table.items .total-row {
          font-weight: bold;
          background: #f0f0f0;
        }
        .amount-words {
          margin: 10px 0;
          font-style: italic;
          font-weight: bold;
        }
        table.gst-summary {
          width: 60%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        table.gst-summary th, table.gst-summary td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
        }
        table.gst-summary th {
          background: #e0e0e0;
        }
        .bank-notes {
          margin-top: 20px;
          border-top: 1px solid #000;
          padding-top: 10px;
          font-size: 11px;
        }
        .notes {
          background: #fff3e0;
          padding: 8px;
          margin-top: 15px;
          border: 1px solid #d7a37a;
        }
        .sign {
          margin-top: 30px;
          text-align: right;
        }
             .footer{
  margin-top:auto;
  background:#6b3f36;
  color:#fff;
  display:flex;
  justify-content:space-between;
  padding:15px 20px;
  font-size:12px;
}

.footer-left{
  width:40%;
}

.footer-right{
  width:55%;
}

.footer-title{
  font-weight:bold;
  margin-bottom:6px;
  font-size:14px;
}

.footer-divider{
  width:2px;
  background:#ffffff80;
  margin:0 15px;
}

.receipt-container{
  display:flex;
  border:1px solid #000;
  margin-top:10px;
}

.patient-box{
  width:65%;
  background:#f2f2f2;
  padding:10px;
  border-right:1px solid #000;
}

.patient-box table{
  width:100%;
  font-size:13px;
}

.patient-box td{
  padding:3px 5px;
}

.label{
  font-weight:bold;
  width:140px;
}

.colon{
  width:10px;
}

.receipt-box{
  width:35%;
  background:#f2f2f2;
}

.receipt-title{
  text-align:center;
  font-weight:bold;
  font-size:18px;
  border-bottom:1px solid #000;
  padding:8px;
}

.receipt-box table{
  width:100%;
  padding:10px;
  font-size:13px;
}

.receipt-box td{
  padding:5px;
}

.payment-container{
  display:flex;
  border-top:2px solid #000;
  border-bottom:2px solid #000;
  background:#f0f0f0;
  padding:15px;
  margin-top:15px;
}

.payment-left{
  width:50%;
}

.payment-right{
  width:50%;
  padding-left:20px;
}

.payment-row{
  display:flex;
  justify-content:space-between;
  margin-bottom:8px;
  font-size:13px;
}

.payment-line{
  display:flex;
  justify-content:space-between;
  margin-top:8px;
  font-weight:bold;
}

.payment-sub{
  font-size:11px;
  color:#444;
  margin-bottom:8px;
}

.balance-line{
  display:flex;
  justify-content:space-between;
  border-top:2px solid #555;
  margin-top:10px;
  padding-top:5px;
  font-weight:bold;
}
      </style>
    </head>
    <body>

      <div class="header">
      <div class="logo">
  <img src="${logo}" style="height:200px;" />
</div>
        <div class="logo">Utpala Ayurdham</div>
        <div class="clinic-info">
          New BEL Rd, Chikkamaranahalli, Dollars Colony, R.M.V. 2nd Stage,
          Bengaluru, Karnataka 560094
          info@utpalaayurdhama.com
          GSTIN: 29ACXPL2065P1ZL
        </div>
      </div>

    <div class="receipt-container">

  <div class="patient-box">
    <table>
      <tr>
        <td class="label">NAME</td>
        <td class="colon">:</td>
        <td>${patient.name}</td>
      </tr>

      <tr>
        <td class="label">AGE </td>
        <td class="colon">:</td>
        <td class="colon">${patient.age} YEARS,</td>
      </tr>
   <tr>
        <td class="label">GENDER</td>
        <td class="colon">:</td>
        <td> ${patient.gender}</td>
      </tr>

      <tr>
        <td class="label">PHONE</td>
        <td class="colon">:</td>
        <td>${patient.mobileOrUHID}</td>
      </tr>

      <tr>
        <td class="label">E-MAIL</td>
        <td class="colon">:</td>
        <td>${patient.email || ""}</td>
      </tr>

      <tr>
        <td class="label">ADDRESS</td>
        <td class="colon">:</td>
        <td>${patient.address}</td>
      </tr>
    </table>
  </div>

  <div class="receipt-box">

    <div class="receipt-title">RECEIPT DETAILS</div>

    <table>
      <tr>
        <td>Receipt No:</td>
        <td>${invoice.no}</td>
      </tr>

      <tr>
        <td>Date</td>
        <td>${invoice.date}</td>
      </tr>

      <tr>
        <td>Time</td>
        <td>${new Date().toLocaleTimeString()}</td>
      </tr>
    </table>

  </div>

</div>

      <table class="items">
        <thead>
          <tr>
            <th>Srl</th>
            <th>Item Name</th>
            <th>HSN Code</th>
            <th>Qty</th>
            <th>Uom</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>GST %</th>
            <th>GST-Amt</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${medicinesRows}
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td></td>
            <td style="text-align:center;">${items.length ? items.reduce((sum, m) => sum + Number(m.quantity || 1), 0).toFixed(2) : "1.00"}</td>
            <td></td>
            <td></td>
            <td style="text-align:right;">${subtotal}</td>
            <td></td>
            <td style="text-align:right;">${gstAmount}</td>
            <td style="text-align:right;">${totalWithGst}</td>
          </tr>
        </tbody>
      </table>

     <div class="payment-container">

  <div class="payment-left">

   

  

  </div>

  <div class="payment-right">

 
   
    <div class="payment-row">
      <span>TRANSACTION TYPE:</span>
      <span>CREDIT</span>
    </div>

    <div class="payment-row">
      <span>AMOUNT COLLECTED:</span>
      <span>₹${totalWithGst}</span>
    </div>


   

  </div>

</div>
<div class="footer">
  <div class="footer-left">
    <div class="footer-title">REACH US AT</div>

    <div><i class="fa-solid fa-envelope"></i> info@utpalaayurdhama.com</div>

    <div><i class="fa-solid fa-phone"></i> +91-7259195959</div>

    <div><i class="fa-solid fa-phone-volume"></i> 080-4054-0333</div>
  </div>

  <div class="footer-divider"></div>

  <div class="footer-right">
    <div class="footer-title">OUR BRANCH(S)</div>

    <div>
      <i class="fa-solid fa-location-dot"></i> RAJESHWARI AYURDHAMA<br>
      #607, Ravi Nenapu, 7th Main road, Havanur Extn,<br>
      Near Hesaraghatta Main Road, Bengaluru – 560073<br>
      <i class="fa-solid fa-envelope"></i> rajeshwariayurdhama@gmail.com
    </div>
  </div>
</div>

     <script>
window.onload = function () {
  window.print();

  // When print dialog closes (print or cancel)
  window.onafterprint = function () {
    window.close();
  };
};
</script>

    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank", "width=950,height=800");
    printWindow.document.write(html);
    printWindow.document.close();

  } catch (error) {
    console.error(error);
    alert("Error fetching prescription");
  }
};