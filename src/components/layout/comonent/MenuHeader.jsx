import { Link } from "react-router-dom";

function MenuHeader({ id, label, icon, onClick }) {
    return (
        <Link
            to="#"
            id={id}
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px",
                color: "var(--color-text-side-bar)",
                fontWeight: 600,
            }}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default MenuHeader;