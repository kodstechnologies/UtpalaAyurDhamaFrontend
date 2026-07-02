import { toast } from "react-toastify";
import { buildOutsideDispensePdf } from "./outsideDispensePdfRender";

export const handleOutsideDownload = async (record) => {
    if (!record) {
        toast.error("No outside dispense data found");
        return;
    }

    try {
        const { pdf, invoiceNo } = await buildOutsideDispensePdf(record);
        pdf.save(`Outside_Dispense_${invoiceNo.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
        toast.success("Outside dispense PDF downloaded successfully");
    } catch (err) {
        console.error("Outside dispense PDF error:", err);
        toast.error("Failed to generate outside dispense PDF");
    }
};
