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

type AuthBody = { username: string; password: string };

export function Login() {
    return (
        <Layout className="tilt-page">
            <Content>
                <div className="tilt-shell" style={{ maxWidth: 460, paddingTop: 80 }}>
                    <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                        <span className="tilt-kicker">Welcome back</span>
                        <h1 className="tilt-hed">Log in to tilt.</h1>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={1}
                        className="tilt-panel"
                        style={{ marginTop: 32 }}
                    >
                        <LoginForm />
                    </motion.div>

                    <motion.p
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        custom={2}
                        style={{ marginTop: 20, textAlign: "center", color: "var(--text)", fontSize: 14 }}
                    >
                        No account yet? <Link to="/register" style={{ color: "var(--accent)" }}>Create one</Link>
                    </motion.p>
                </div>
            </Content>
        </Layout>
    );
}

function LoginForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(async (body: AuthBody) => {
        setError(null);
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/login`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                const res_data = await response.json();
                localStorage.setItem("token", res_data.token);
                localStorage.setItem("username", body.username);
                navigate("/feed");
                return;
            }
            if (response.status === 403) {
                setError("Please verify your email before logging in.");
                return;
            }
            const data = await response.json().catch(() => ({}));
            setError(data.error || "Incorrect username or password.");
            localStorage.removeItem("token");
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
            setError(data.error || "Google sign-in failed.");
        } catch {
            setError("Network error. Try again.");
        } finally {
            setSubmitting(false);
        }
    }, [navigate]);

    return (
        <Form className="tilt-form" layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
                <Input autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Enter your password" }]}
                extra={<Link to="/forgot-password" style={{ fontSize: 12, color: "var(--text)" }}>Forgot password?</Link>}
            >
                <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                    Log in
                </Button>
            </Form.Item>
            <Divider plain style={{ margin: "28px 0 20px", color: "var(--text)" }}>or</Divider>
            <Space direction="vertical" style={{ width: "100%" }} align="center">
                <GoogleLogin
                    onSuccess={(resp) => { if (resp.credential) submitGoogle(resp.credential); }}
                    onError={() => setError("Google sign-in failed.")}
                    theme="outline"
                    size="large"
                    width="340"
                />
            </Space>
        </Form>
    );
}
