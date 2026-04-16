import { Alert, Button, Form, Input, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

export function ForgotPassword() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const submit = useCallback(async (body: { email: string }) => {
        setError(null);
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/forgot-password`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                setDone(true);
                return;
            }
            const data = await response.json().catch(() => ({}));
            setError(data.error || "Something went wrong. Try again.");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setSubmitting(false);
        }
    }, []);

    return (
        <Layout className="tilt-page">
            <Content>
                <div className="tilt-shell" style={{ maxWidth: 460, paddingTop: 80 }}>
                    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                        <span className="tilt-kicker">Forgot password</span>
                        <h1 className="tilt-hed">We'll send a reset link.</h1>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={1}
                        className="tilt-panel"
                        style={{ marginTop: 32 }}
                    >
                        {done ? (
                            <Alert
                                type="success"
                                showIcon
                                message="Check your email"
                                description="If that email is registered, a reset link is on its way. The link expires in 1 hour."
                            />
                        ) : (
                            <Form className="tilt-form" layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
                                {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                                <Form.Item label="Email" name="email" rules={[
                                    { required: true, message: "Enter your email" },
                                    { type: "email", message: "Not a valid email" },
                                ]}>
                                    <Input type="email" autoComplete="email" size="large" />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                                        Send reset link
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </motion.div>

                    <motion.p
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={2}
                        style={{ marginTop: 20, textAlign: "center", color: "var(--text)", fontSize: 14 }}
                    >
                        Remembered it? <Link to="/login" style={{ color: "var(--accent)" }}>Back to log in</Link>
                    </motion.p>
                </div>
            </Content>
        </Layout>
    );
}
