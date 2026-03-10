import React from "react";

function CancelButton({ onClick, children = "Cancel", style = {} }) {
    return (
        <button
            onClick={onClick}
            className="transition-all font-semibold rounded-lg"
            style={{
                padding: "10px 20px",
                borderRadius: "10px",
                backgroundColor: "var(--color-bg-card)",
                color: "var(--color-text-dark)",
                border: "1px solid var(--color-icon-6-dark)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "0.3s",
                ...style,
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--color-bg-card-hover)";
                e.target.style.color = "var(--color-text-dark-b)";
                e.target.style.borderColor = "var(--color-btn-dark)";
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--color-bg-card)";
                e.target.style.color = "var(--color-text-dark)";
                e.target.style.borderColor = "var(--color-icon-6-dark)";
            }}
        >
            {children}
        </button>
    );
}

export default CancelButton;
