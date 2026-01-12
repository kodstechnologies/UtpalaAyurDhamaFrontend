import React from "react";
import { useNavigate } from "react-router-dom";

function SubmitButton({ text = "Submit", style = {}, className = "", onClick, type = "button", disabled = false }) {
    const navigate = useNavigate();

    function handleClick(e) {
        if (type === "submit") {
            // For submit buttons, let the form handle submission naturally
            // Don't call onClick for submit buttons - form onSubmit will handle it
            return;
        }
        
        // For regular buttons, use the old behavior
        if (onClick) {
            onClick(e);
            return;
        }
        navigate("/admin/dashboard");
    }

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled}
            className={`submit-btn flex items-center justify-center gap-2 ${className}`}
            style={{
                padding: "10px 22px",
                backgroundColor: disabled ? "var(--color-disabled)" : "var(--color-btn-b)",
                color: "var(--color-light)",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                opacity: disabled ? 0.6 : 1,
                ...style,
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = "var(--color-btn-dark-b)";
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = "var(--color-btn-b)";
                }
            }}
        >
            {text}
        </button>
    );
}

export default SubmitButton;
