import { Alert, Button, Form, Input, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(async ({ newPassword }: { newPassword: string }) => {
        if (!token) {
            setError("Missing reset token. Request a new reset link.");
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/reset-password`, {
                method: "POST",
                body: JSON.stringify({ token, newPassword }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                navigate("/login");
                return;
            }
            const data = await response.json().catch(() => ({}));
            setError(data.error || "Reset failed. The link may have expired.");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setSubmitting(false);
        }
    }, [token, navigate]);

    return (
        <Layout className="tilt-page">
            <Content>
                <div className="tilt-shell" style={{ maxWidth: 460, paddingTop: 80 }}>
                    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                        <span className="tilt-kicker">Reset password</span>
                        <h1 className="tilt-hed">Choose a new one.</h1>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={1}
                        className="tilt-panel"
                        style={{ marginTop: 32 }}
                    >
                        {!token && (
                            <Alert
                                type="warning"
                                showIcon
                                message="No token in link"
                                description="This page needs a ?token=... from your reset email."
                                style={{ marginBottom: 20 }}
                            />
                        )}

                        <Form className="tilt-form" layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting || !token}>
                            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                            <Form.Item label="New password" name="newPassword" rules={[
                                { required: true, message: "Enter a new password" },
                                { min: 6, message: "At least 6 characters" },
                            ]}>
                                <Input.Password autoComplete="new-password" size="large" />
                            </Form.Item>
                            <Form.Item label="Confirm password" name="confirm" dependencies={["newPassword"]} rules={[
                                { required: true, message: "Confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                                        return Promise.reject(new Error("Passwords don't match"));
                                    },
                                }),
                            ]}>
                                <Input.Password autoComplete="new-password" size="large" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                                    Reset password
                                </Button>
                            </Form.Item>
                        </Form>
                    </motion.div>

                    <motion.p
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={2}
                        style={{ marginTop: 20, textAlign: "center", color: "var(--text)", fontSize: 14 }}
                    >
                        <Link to="/login" style={{ color: "var(--accent)" }}>Back to log in</Link>
                    </motion.p>
                </div>
            </Content>
        </Layout>
    );
}
