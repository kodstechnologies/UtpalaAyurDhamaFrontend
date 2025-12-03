import { Link } from "react-router-dom";

function MenuItemList({ className, items = [], activeClassName }) {
    return (
        <ul className={className} style={{ display: "none" }}>
            {items.map((item) => (
                <li key={item.key}>
                    <Link
                        to={item.to}
                        className={activeClassName === item.key ? "active" : ""}
                        style={{
                            padding: "10px 35px",
                            display: "block",
                            color: "var(--color-text-dark)",
                        }}
                    >
                        {item.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default MenuItemList;