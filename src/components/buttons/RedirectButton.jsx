import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RedirectButton({
    text = "Click Here",
    link = "",
    onClick = null,
    state = null,
    icon = null,
    iconPosition = "left", // "left" or "right"
    variant = "primary", // "primary", "secondary", "outline", "ghost"
    size = "medium", // "small", "medium", "large"
    fullWidth = false,
    disabled = false,
    loading = false,
    className = "",
    style = {},
}) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    // Inject styles into document head
    useEffect(() => {
        const styleId = 'redirect-button-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .redirect-button:focus {
                    outline: 2px solid var(--color-primary, #2563eb);
                    outline-offset: 2px;
                }
                .redirect-button:focus:not(:focus-visible) {
                    outline: none;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const handleClick = (e) => {
        if (disabled || loading) return;
        if (onClick) return onClick(e);
        if (link) return navigate(link, { state });
    };

    // Variant styles
    const variants = {
        primary: {
            background: "var(--color-primary, #2563eb)",
            hover: "var(--color-primary-dark, #1d4ed8)",
            color: "var(--color-light, #ffffff)",
            shadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
        },
        secondary: {
            background: "var(--color-secondary, #7c3aed)",
            hover: "var(--color-secondary-dark, #6d28d9)",
            color: "var(--color-light, #ffffff)",
            shadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
        },
        outline: {
            background: "transparent",
            hover: "var(--color-surface, #f8fafc)",
            color: "var(--color-primary, #2563eb)",
            border: "2px solid var(--color-primary, #2563eb)",
            shadow: "none",
        },
        ghost: {
            background: "transparent",
            hover: "var(--color-surface, #f8fafc)",
            color: "var(--color-text, #334155)",
            shadow: "none",
        },
    };

    // Size styles
    const sizes = {
        small: {
            padding: "8px 16px",
            fontSize: "0.875rem",
            iconSize: "16px",
        },
        medium: {
            padding: "12px 24px",
            fontSize: "1rem",
            iconSize: "20px",
        },
        large: {
            padding: "16px 32px",
            fontSize: "1.125rem",
            iconSize: "24px",
        },
    };

    const currentVariant = variants[variant] || variants.primary;
    const currentSize = sizes[size] || sizes.medium;

    const buttonStyles = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: "600",
        borderRadius: "10px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: currentVariant.border || "none",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        backgroundColor: isPressed
            ? currentVariant.hover
            : isHovered
                ? currentVariant.hover
                : currentVariant.background,
        color: currentVariant.color,
        boxShadow: isPressed
            ? "0 2px 4px rgba(0,0,0,0.1)"
            : isHovered
                ? currentVariant.shadow
                : "0 2px 8px rgba(0,0,0,0.1)",
        transform: isPressed ? "translateY(2px)" : "translateY(0)",
        opacity: disabled || loading ? 0.6 : 1,
        position: "relative",
        overflow: "hidden",
        ...style,
    };

    // Loading spinner
    const LoadingSpinner = () => (
        <div className="loading-spinner">
            <svg
                width={currentSize.iconSize}
                height={currentSize.iconSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ animation: "spin 1s linear infinite" }}
            >
                <path
                    d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="32;0"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
    );

    return (
        <button
            onClick={handleClick}
            className={`redirect-button ${className}`}
            style={buttonStyles}
            disabled={disabled || loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            {/* Ripple effect */}
            <span
                style={{
                    position: "absolute",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    transform: "scale(0)",
                    animation: "ripple 0.6s linear",
                    pointerEvents: "none",
                }}
            />

            {loading && <LoadingSpinner />}

            {!loading && icon && iconPosition === "left" && (
                <span style={{ display: "flex", fontSize: currentSize.iconSize }}>
                    {icon}
                </span>
            )}

            {text}

            {!loading && icon && iconPosition === "right" && (
                <span style={{ display: "flex", fontSize: currentSize.iconSize }}>
                    {icon}
                </span>
            )}
        </button>
    );
}

export default RedirectButton;