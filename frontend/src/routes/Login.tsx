import { Alert, Button, Card, Divider, Form, Input, Layout, Space, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { saveAuth } from "../utils/auth";

// relative URLs in prod, nginx proxies /api to backend. override VITE_API_BASE for local dev -dechante
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type AuthBody = { username: string; password: string };

export function Login() {
    return (
        <Layout style={{ minHeight: "100dvh", background: "var(--bg)" }}>
            <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <Card style={{ width: "100%", maxWidth: 420 }} variant="outlined">
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <Typography.Title level={3} style={{ margin: 0 }}>Log in</Typography.Title>
                            <Typography.Text type="secondary">Welcome back.</Typography.Text>
                        </div>
                        <LoginForm />
                        <Typography.Text type="secondary" style={{ textAlign: "center", display: "block" }}>
                            No account? <Link to="/register">Create one</Link>
                        </Typography.Text>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}

export function LoginForm() {
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
        <Form layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
                <Input autoComplete="username" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password" }]}
                extra={<Link to="/forgot-password" style={{ fontSize: 12 }}>Forgot password?</Link>}>
                <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block>
                    Log in
                </Button>
            </Form.Item>
            <Divider plain style={{ margin: "24px 0 16px" }}>or</Divider>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                    onSuccess={(resp) => { if (resp.credential) submitGoogle(resp.credential); }}
                    onError={() => setError("Google sign-in failed.")}
                    theme="outline"
                    size="large"
                    width="340"
                />
            </div>
        </Form>
    );
}
