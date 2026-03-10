import React from "react";

function CardBorder({
    children,
    width = "100%",
    height = "auto",
    padding = "1rem",
    bg = "var(--color-bg-card)",
    // border = "1px solid var(--color-border)",
    radius = "12px",
    shadow = "0px 4px 12px rgba(0,0,0,0.08)",

    // NEW FLEX PROPS
    flex = true,
    justify = "between",   // between, center, start, end
    align = "center",       // center, start, end
    wrap = true,            // responsive wrapping

    style = {},
    className = "",
}) {
    const justifyMap = {
        between: "space-between",
        center: "center",
        start: "flex-start",
        end: "flex-end",
    };

    const alignMap = {
        center: "center",
        start: "flex-start",
        end: "flex-end",
    };

    return (
        <div
            className={className}
            style={{
                width,
                height,
                padding,
                backgroundColor: bg,
                // border,
                borderRadius: radius,
                boxShadow: shadow,

                // FLEX PROPERTIES
                display: flex ? "flex" : "block",
                justifyContent: justifyMap[justify],
                alignItems: alignMap[align],
                flexWrap: wrap ? "wrap" : "nowrap",
                gap: "1rem",

                transition: "0.2s ease",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export default CardBorder;
