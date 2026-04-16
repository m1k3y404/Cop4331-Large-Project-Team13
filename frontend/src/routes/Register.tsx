import { Alert, Button, Divider, Form, Input, Layout, Space } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { saveAuth } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

type RegisterBody = { username: string; email: string; password: string };

export function Register() {
    return (
        <Layout className="tilt-page">
            <Content>
                <div className="tilt-shell" style={{ maxWidth: 460, paddingTop: 80 }}>
                    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                        <span className="tilt-kicker">Join the feed</span>
                        <h1 className="tilt-hed">Create your tilt.</h1>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={1}
                        className="tilt-panel"
                        style={{ marginTop: 32 }}
                    >
                        <RegisterForm />
                    </motion.div>

                    <motion.p
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={2}
                        style={{ marginTop: 20, textAlign: "center", color: "var(--text)", fontSize: 14 }}
                    >
                        Already have one? <Link to="/login" style={{ color: "var(--accent)" }}>Log in</Link>
                    </motion.p>
                </div>
            </Content>
        </Layout>
    );
}

function RegisterForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(async (body: RegisterBody) => {
        setError(null);
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/register`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });
            if (response.status === 201) {
                navigate("/verify-email");
                return;
            }
            const data = await response.json().catch(() => ({}));
            setError(data.error || "Registration failed.");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setSubmitting(false);
        }
    }, [navigate]);

    const submitGoogle = useCallback(async (credential: string) => {
        setError(null);
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/google`, {
                method: "POST",
                body: JSON.stringify({ credential }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.status === 200) {
                const data = await response.json();
                saveAuth(data);
                navigate("/feed");
                return;
            }
            const data = await response.json().catch(() => ({}));
            setError(data.error || "Google sign-up failed.");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setSubmitting(false);
        }
    }, [navigate]);

    return (
        <Form className="tilt-form" layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form.Item label="Username" name="username" rules={[
                { required: true, message: "Pick a username" },
                { min: 3, message: "At least 3 characters" },
            ]}>
                <Input autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[
                { required: true, message: "Enter your email" },
                { type: "email", message: "Not a valid email" },
            ]}>
                <Input type="email" autoComplete="email" size="large" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[
                { required: true, message: "Choose a password" },
                { min: 6, message: "At least 6 characters" },
            ]}>
                <Input.Password autoComplete="new-password" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                    Create account
                </Button>
            </Form.Item>
            <Divider plain style={{ margin: "28px 0 20px", color: "var(--text)" }}>or</Divider>
            <Space direction="vertical" style={{ width: "100%" }} align="center">
                <GoogleLogin
                    onSuccess={(resp) => { if (resp.credential) submitGoogle(resp.credential); }}
                    onError={() => setError("Google sign-up failed.")}
                    theme="outline"
                    size="large"
                    width="340"
                    text="signup_with"
                />
            </Space>
        </Form>
    );
}
