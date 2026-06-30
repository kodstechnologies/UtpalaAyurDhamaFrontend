import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { pdfPrHeader } from "../../../../components/pdf/pdfPrHeader";
import { getNote } from "../../../../components/pdf/note";
import {
  buildPrescriptionBodyHtml,
  buildPrescriptionDocumentData,
} from "./prescriptionPdfUtils";

export const handleDownload = async (id, billingSnapshot = {}) => {
  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

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

    const doc = buildPrescriptionDocumentData(data, billingSnapshot, receptionistName);
    const bodyHtml = buildPrescriptionBodyHtml(doc, "pdf");

    const renderToCanvas = async (html, width = 794) => {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "0";
      el.style.width = `${width}px`;
      el.style.background = "#fff";
      el.style.fontFamily = "Arial, Helvetica, sans-serif";
      el.style.color = "#000";
      el.innerHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
        ${html}
      `;
      document.body.appendChild(el);
      await new Promise((r) => setTimeout(r, 500));
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: width,
        windowHeight: el.scrollHeight,
      });
      document.body.removeChild(el);
      return canvas;
    };

    const headerHtml = `<div style="width:794px; box-sizing:border-box;">${pdfPrHeader()}</div>`;
    const footerHtml = `<div style="width:794px; box-sizing:border-box; margin-bottom:45px;">${getNote()}</div>`;
    const bodyCanvasHtml = `<div style="width:794px; box-sizing:border-box;">${bodyHtml}</div>`;

    const [headerCanvas, footerCanvas, bodyCanvas] = await Promise.all([
      renderToCanvas(headerHtml),
      renderToCanvas(footerHtml),
      renderToCanvas(bodyCanvasHtml),
    ]);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pdfW - margin * 2;

    const pxToMm = (canvas) => (canvas.height / canvas.width) * contentW;

    const headerH = pxToMm(headerCanvas);
    const footerH = pxToMm(footerCanvas);
    const bodyTotalH = pxToMm(bodyCanvas);

    const topPad = 5;
    const botPad = 5;
    const bodyAreaH = pdfH - headerH - footerH - topPad - botPad;

    const headerImg = headerCanvas.toDataURL("image/png");
    const footerImg = footerCanvas.toDataURL("image/png");

    const totalPages = Math.ceil(bodyTotalH / bodyAreaH);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      pdf.addImage(headerImg, "PNG", margin, 0, contentW, headerH);

      const bodyY = headerH + topPad;
      const srcYPx = ((page * bodyAreaH) / bodyTotalH) * bodyCanvas.height;
      const srcHPx = Math.min(
        (bodyAreaH / bodyTotalH) * bodyCanvas.height,
        bodyCanvas.height - srcYPx
      );

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = bodyCanvas.width;
      sliceCanvas.height = Math.round(srcHPx);
      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        bodyCanvas,
        0,
        Math.round(srcYPx),
        bodyCanvas.width,
        Math.round(srcHPx),
        0,
        0,
        bodyCanvas.width,
        Math.round(srcHPx)
      );

      const sliceImgData = sliceCanvas.toDataURL("image/png");
      const sliceH = (sliceCanvas.height / sliceCanvas.width) * contentW;
      pdf.addImage(sliceImgData, "PNG", margin, bodyY, contentW, sliceH);

      const footerY = pdfH - footerH;
      pdf.addImage(footerImg, "PNG", margin, footerY, contentW, footerH);

      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${page + 1} of ${totalPages}`, pdfW / 2, pdfH - 2, { align: "center" });
    }

    const fileName = doc.invoice.no
      ? `Prescription_${doc.invoice.no.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`
      : "Prescription.pdf";
    pdf.save(fileName);
    toast.success("Prescription downloaded successfully");
  } catch (err) {
    console.error("PDF generation error:", err);
    toast.error("Failed to generate prescription PDF");
  }
};
