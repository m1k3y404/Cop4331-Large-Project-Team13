import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { CheckCircleFilled, CloseCircleFilled, MailOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");

    let kicker: string;
    let hed: string;
    let sub: string;
    let icon: React.ReactNode;
    let iconBg: string;
    let cta: React.ReactNode;

    if (status === "success") {
        kicker = "Verified";
        hed = "You're in.";
        sub = "Your account is confirmed. Log in to start posting.";
        icon = <CheckCircleFilled />;
        iconBg = "rgba(34, 197, 94, 0.15)";
        cta = <Link to="/login" style={{ color: "var(--accent)" }}>Go to log in →</Link>;
    } else if (status === "error") {
        kicker = "Link expired";
        hed = "That didn't work.";
        sub = "The verification link is invalid or past its 24-hour window. Register again to resend.";
        icon = <CloseCircleFilled />;
        iconBg = "rgba(239, 68, 68, 0.15)";
        cta = <Link to="/register" style={{ color: "var(--accent)" }}>Back to register →</Link>;
    } else {
        kicker = "Check your inbox";
        hed = "Open the email we sent.";
        sub = "Click the link inside to activate your account. It expires in 24 hours.";
        icon = <MailOutlined />;
        iconBg = "var(--accent-bg)";
        cta = <Link to="/login" style={{ color: "var(--accent)" }}>Back to log in →</Link>;
    }

    return (
        <Layout className="tilt-page">
            <Content>
                <div className="tilt-shell" style={{ maxWidth: 500, paddingTop: 80 }}>
                    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                        <span className="tilt-kicker">{kicker}</span>
                        <h1 className="tilt-hed">{hed}</h1>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={1}
                        className="tilt-panel"
                        style={{ marginTop: 32, textAlign: "center" }}
                    >
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                margin: "0 auto 24px",
                                borderRadius: "50%",
                                background: iconBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 32,
                                color: status === "success" ? "#22c55e" : status === "error" ? "#ef4444" : "var(--accent)",
                            }}
                        >
                            {icon}
                        </div>
                        <p style={{ margin: "0 auto 24px", color: "var(--text)", maxWidth: "38ch", lineHeight: 1.55 }}>
                            {sub}
                        </p>
                        {cta}
                    </motion.div>
                </div>
            </Content>
        </Layout>
    );
}
