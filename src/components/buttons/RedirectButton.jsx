import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function RedirectButton({
    text = "Click Here",
    link = "",            // URL to navigate
    component: Component, // React Component to render
    onClick = null,       // Custom function
    state = null,         // optional router state
    sx = {},              // custom styles
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        // 1️⃣ If custom function is provided
        if (onClick) {
            onClick();
            return;
        }

        // 2️⃣ If link URL is provided → navigate
        if (link) {
            navigate(link, { state });
            return;
        }

        // 3️⃣ If a component is passed → render it directly
        if (Component) {
            navigate("", {
                state: { renderComponent: Component },
            });
            return;
        }
    };

    return (
        <Button
            variant="contained"
            onClick={handleClick}
            sx={{
                textTransform: "none",
                background: "var(--color-primary)",
                "&:hover": { background: "var(--color-primary-dark)" },
                ...sx,
            }}
        >
            {text}
        </Button>
    );
}

export default RedirectButton;
