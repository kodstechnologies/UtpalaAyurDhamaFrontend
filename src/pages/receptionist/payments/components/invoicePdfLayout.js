export const SECTION_GAP_MM = 1.5;
export const SUMMARY_NOTES_GAP_MM = 4;

export const trimCanvasBottomWhitespace = (canvas, whiteThreshold = 248) => {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let bottom = height;
  for (let y = height - 1; y >= 0; y -= 1) {
    let rowHasContent = false;
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a > 12 && (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold)) {
        rowHasContent = true;
        break;
      }
    }
    if (rowHasContent) {
      bottom = y + 1;
      break;
    }
  }

  if (bottom >= height) return canvas;

  const trimmed = document.createElement("canvas");
  trimmed.width = width;
  trimmed.height = bottom;
  trimmed.getContext("2d").drawImage(canvas, 0, 0);
  return trimmed;
};

export const estimatePdfPageCount = (sections, pxToMm, bodyAreaH) => {
  let pages = 1;
  let usedH = 0;

  sections.forEach((canvas, idx) => {
    const sectionH = pxToMm(canvas);
    const gap = idx > 0 ? SECTION_GAP_MM : 0;

    if (usedH > 0 && usedH + gap + sectionH > bodyAreaH) {
      pages += 1;
      usedH = 0;
    }

    if (usedH > 0) usedH += gap;
    usedH += sectionH;
  });

  return pages;
};

export const layoutPdfSections = ({
  pdf,
  sections,
  pxToMm,
  bodyAreaH,
  headerH,
  topPad,
  brownFooterH,
  notesSectionH = 0,
  pdfH,
  pdfW,
  margin,
  contentW,
  drawPageChrome,
  drawBrownFooter,
}) => {
  let currentPage = 1;
  let cursorY = headerH + topPad;
  let usedBodyH = 0;
  const pagesWithContent = new Set();
  const footerY = pdfH - brownFooterH - 6;
  const notesReserve = notesSectionH > 0
    ? notesSectionH + SECTION_GAP_MM + SUMMARY_NOTES_GAP_MM
    : 0;

  const startNewPage = () => {
    drawBrownFooter();
    pdf.addPage();
    currentPage += 1;
    cursorY = headerH + topPad;
    usedBodyH = 0;
    drawPageChrome();
  };

  const drawAllPageNumbers = (totalPages) => {
    for (let page = 1; page <= totalPages; page += 1) {
      pdf.setPage(page);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(pdfW / 2 - 22, pdfH - 7.5, 44, 5, "F");
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${page} of ${totalPages}`, pdfW / 2, pdfH - 5, { align: "center" });
    }
  };

  drawPageChrome();

  sections.forEach((canvas, idx) => {
    const sectionH = pxToMm(canvas);
    const sectionImg = canvas.toDataURL("image/png");
    const isNotesSection = idx === sections.length - 1;
    const isSummarySection = idx === sections.length - 2 && notesSectionH > 0;
    const gap = idx > 0 ? SECTION_GAP_MM : 0;

    const placementY = usedBodyH > 0 ? cursorY + gap : cursorY;

    if (isSummarySection) {
      const maxEndY = footerY - notesReserve;
      const available = maxEndY - placementY;
      if (usedBodyH > 0 && sectionH + 1 > available) {
        startNewPage();
      } else if (usedBodyH > 0) {
        cursorY += gap;
        usedBodyH += gap;
      }
    } else if (isNotesSection) {
      const minNotesY = placementY + SECTION_GAP_MM;
      const anchoredY = footerY - sectionH - 1;
      if (usedBodyH > 0 && (sectionH > footerY - minNotesY - 1 || anchoredY < minNotesY)) {
        startNewPage();
      } else if (usedBodyH > 0) {
        cursorY += gap;
        usedBodyH += gap;
      }
    } else {
      const requiresNewPage = usedBodyH > 0 && usedBodyH + gap + sectionH > bodyAreaH;
      if (requiresNewPage) {
        startNewPage();
      } else if (usedBodyH > 0) {
        cursorY += gap;
        usedBodyH += gap;
      }
    }

    let renderH = sectionH > bodyAreaH ? bodyAreaH : sectionH;
    let drawY = cursorY;

    if (isSummarySection) {
      let maxH = footerY - notesReserve - drawY;
      if (renderH > maxH) {
        startNewPage();
        drawY = cursorY;
        maxH = footerY - notesReserve - drawY;
        renderH = Math.min(sectionH, maxH);
      }
    }

    if (isNotesSection) {
      const anchoredY = footerY - renderH - 1;
      const minY = cursorY + SECTION_GAP_MM;
      if (anchoredY < minY) {
        startNewPage();
        drawY = footerY - renderH - 1;
      } else {
        drawY = anchoredY;
      }
    }

    pdf.addImage(sectionImg, "PNG", margin, drawY, contentW, renderH);
    pagesWithContent.add(currentPage);

    if (isNotesSection) {
      cursorY = drawY + renderH;
      usedBodyH = cursorY - (headerH + topPad);
    } else {
      const contentEndY = drawY + renderH;
      cursorY = contentEndY;
      usedBodyH = contentEndY - (headerH + topPad);
    }
  });

  drawBrownFooter();

  let pageCount = pdf.internal.getNumberOfPages();
  while (pageCount > 1 && !pagesWithContent.has(pageCount)) {
    pdf.deletePage(pageCount);
    pageCount -= 1;
  }

  drawAllPageNumbers(pageCount);
};
