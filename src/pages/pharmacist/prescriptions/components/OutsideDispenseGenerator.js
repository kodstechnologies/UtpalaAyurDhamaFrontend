import { toast } from "react-toastify";
import { buildOutsideDispensePdf } from "./outsideDispensePdfRender";

export const handleOutsidePrint = async (record) => {
    if (!record) {
        toast.error("No outside dispense data found");
        return;
    }

    try {
        const { pdf } = await buildOutsideDispensePdf(record);

        pdf.autoPrint({ variant: "non-conform" });

        const blob = pdf.output("blob");
        const blobURL = URL.createObjectURL(blob);

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.src = blobURL;
        document.body.appendChild(iframe);

        await new Promise((resolve) => {
            let resolved = false;
            const finish = () => {
                if (resolved) return;
                resolved = true;
                resolve();
            };

            iframe.onload = () => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (e) {
                    console.warn("Iframe print failed, falling back to new window", e);
                    window.open(blobURL, "_blank");
                }
                setTimeout(finish, 2000);
            };

            setTimeout(finish, 10000);
        });
    } catch (error) {
        console.error("Outside dispense print error:", error);
        toast.error("Failed to print outside dispense. Please try again.");
    }
};
