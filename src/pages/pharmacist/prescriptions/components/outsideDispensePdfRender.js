import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { pdfPrHeader } from "../../../../components/pdf/pdfPrHeader";
import { getFooter } from "../../../../components/pdf/pdfFooter";
import { layoutPdfSections } from "../../../receptionist/payments/components/invoicePdfLayout";
import {
    buildOutsideDispensePdfData,
    buildOutsideDispenseInfoSectionHtml,
    buildOutsideDispenseMedicinesSectionHtml,
    buildOutsideDispenseSummarySectionHtml,
} from "./outsideDispensePdfUtils";

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
    const captureHeight = el.scrollHeight + 16;
    const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: width,
        windowHeight: captureHeight,
        height: captureHeight,
    });
    document.body.removeChild(el);
    return canvas;
};

export const buildOutsideDispensePdf = async (record) => {
    const data = buildOutsideDispensePdfData(record);

    const headerHtml = `<div style="width:794px; box-sizing:border-box;">${pdfPrHeader()}</div>`;
    const brownFooterHtml = `<div style="width:794px; box-sizing:border-box;">${getFooter()}</div>`;
    const infoSectionHtml = buildOutsideDispenseInfoSectionHtml(data);
    const medicinesSectionHtml = buildOutsideDispenseMedicinesSectionHtml(data);
    const summarySectionHtml = buildOutsideDispenseSummarySectionHtml(data);

    const [headerCanvas, brownFooterCanvas, infoCanvas, medicinesCanvas, summaryCanvas] = await Promise.all([
        renderToCanvas(headerHtml),
        renderToCanvas(brownFooterHtml),
        renderToCanvas(infoSectionHtml),
        renderToCanvas(medicinesSectionHtml),
        renderToCanvas(summarySectionHtml),
    ]);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentW = pdfW - margin * 2;

    const pxToMm = (canvas) => (canvas.height / canvas.width) * contentW;
    const headerH = pxToMm(headerCanvas);
    const brownFooterH = pxToMm(brownFooterCanvas);
    const topPad = 0;
    const botPad = 2;
    const bodyAreaH = pdfH - headerH - brownFooterH - topPad - botPad;

    const headerImg = headerCanvas.toDataURL("image/png");
    const brownFooterImg = brownFooterCanvas.toDataURL("image/png");
    const sections = [infoCanvas, medicinesCanvas, summaryCanvas];

    const drawPageChrome = () => {
        pdf.addImage(headerImg, "PNG", margin, 0, contentW, headerH);
    };

    const drawBrownFooter = () => {
        const footerY = pdfH - brownFooterH - 6;
        pdf.addImage(brownFooterImg, "PNG", margin, footerY, contentW, brownFooterH);
    };

    layoutPdfSections({
        pdf,
        sections,
        pxToMm,
        bodyAreaH,
        headerH,
        topPad,
        brownFooterH,
        notesSectionH: 0,
        pdfH,
        pdfW,
        margin,
        contentW,
        drawPageChrome,
        drawBrownFooter,
    });

    return { pdf, invoiceNo: data.invoice.no };
};
