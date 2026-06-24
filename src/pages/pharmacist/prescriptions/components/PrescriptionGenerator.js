import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../../../../config/api";
import { getFooter } from "../../../../components/pdf/pdfFooter";
import { getHeader } from "../../../../components/pdf/pdfHeader";
import {
  buildPrescriptionBodyHtml,
  buildPrescriptionDocumentData,
  buildPrescriptionPrintHtml,
} from "./prescriptionPdfUtils";

export const handlePrint = async (id, billingSnapshot = {}) => {
  const receptionist = JSON.parse(localStorage.getItem("user"));
  const receptionistName = receptionist?.name;

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

    const doc = buildPrescriptionDocumentData(data, billingSnapshot, receptionistName);
    const bodyHtml = buildPrescriptionBodyHtml(doc, "print");
    const html = buildPrescriptionPrintHtml(getHeader(), bodyHtml, getFooter());

    const printWindow = window.open("", "_blank", "width=1000,height=800,scrollbars=yes,resizable=yes");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert("Popup blocked! Please allow popups to print the prescription.");
    }
  } catch (error) {
    console.error("Error fetching prescription:", error);
    alert("Error fetching prescription. Please try again.");
  }
};
