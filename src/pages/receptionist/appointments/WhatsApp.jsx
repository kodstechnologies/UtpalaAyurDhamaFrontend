import { useNavigate, useSearchParams } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import { Box, TextField, Button, Typography } from "@mui/material";

function WhatsAppPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientName = searchParams.get("patientName") || "";
    const contact = searchParams.get("contact") || "";

    const handleSendWhatsApp = (type) => {
        const phoneNumber = contact.replace(/\D/g, "");
        let message = "";
        
        if (type === "form") {
            message = `Hello ${patientName}, please fill out your data collection form: [FORM_LINK]`;
        } else if (type === "reminder") {
            message = `Hello ${patientName}, this is a reminder about your upcoming appointment. Please confirm your attendance.`;
        }
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        navigate(-1);
    };

    return (
        <div>
            <HeadingCard
                title="Send Message via WhatsApp"
                subtitle={`Patient: ${patientName}`}
                breadcrumbItems={[
                    { label: "Receptionist", url: "/receptionist/dashboard" },
                    { label: "Appointments", url: "/receptionist/appointments" },
                    { label: "WhatsApp Message" },
                ]}
            />

            <Box
                sx={{
                    backgroundColor: "var(--color-bg-a)",
                    borderRadius: "12px",
                    p: 3,
                    mt: 2,
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <Typography sx={{ mb: 2 }}>
                    Send a message to <strong>{patientName}</strong>. You can send a data collection form link or an appointment reminder.
                </Typography>
                
                <TextField
                    label="WhatsApp Number"
                    fullWidth
                    value={contact}
                    disabled
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleSendWhatsApp("form")}
                    >
                        Send Form Link
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={() => handleSendWhatsApp("reminder")}
                    >
                        Send Reminder
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default WhatsAppPage;

