import React from "react";
import { Link } from "react-router-dom";

function Breadcrumb({
    items = [],
    show = true,
    separator = "›",
    style = {},
}) {
    if (!show || items.length === 0) return null;

    return (
        <div style={{ marginBottom: "15px", ...style }}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <span key={index}>
                        {!isLast ? (
                            <>
                                <Link
                                    to={item.url}
                                    state={item.state || null}   // ⭐ support for state
                                    style={{
                                        color: "var(--color-primary)",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                >
                                    {item.label}
                                </Link>

                                <span style={{ margin: "0 8px", color: "#aaa" }}>
                                    {separator}
                                </span>
                            </>
                        ) : (
                            <span
                                style={{
                                    color: "var(--color-text-light)",
                                    fontWeight: 500,
                                }}
                            >
                                {item.label}
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

export default Breadcrumb;
