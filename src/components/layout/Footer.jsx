function Footer() {
    return (
        <div
            className="text-center p-1"
            style={{
                backgroundColor: "var(--color-bg-a)",
                color: "var(--color-text-dark)",
                fontSize: "0.9rem",
                marginTop: "auto",
            }}
        >
            © {new Date().getFullYear()}. Utpala Ayurdhama — All rights reserved.
        </div>
    );
}

export default Footer;
