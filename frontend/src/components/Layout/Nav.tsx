import { Link } from "react-router";
import Brand from "./Brand";
import { Button } from "antd";

export default function Nav() {
    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 48px",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                background: "color-mix(in srgb, var(--bg) 85%, transparent)",
                backdropFilter: "blur(12px)",
                zIndex: 10,
            }}
        >
            <Brand size={22} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link to="/login" style={{ color: "var(--text)", fontSize: 14, padding: "6px 12px" }}>
                    Log in
                </Link>
                <Link to="/register">
                    <Button type="primary" size="middle">Get started</Button>
                </Link>
            </div>
        </nav>
    );
}