import { Alert, Button, Card, Divider, Form, Input, Layout, Space, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { saveAuth } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type RegisterBody = { username: string; email: string; password: string };

export function Register() {
    return (
        <Layout style={{ minHeight: "100dvh", background: "var(--bg)" }}>
            <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <Card style={{ width: "100%", maxWidth: 420 }} variant="outlined">
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <Typography.Title level={3} style={{ margin: 0 }}>Create an account</Typography.Title>
                            <Typography.Text type="secondary">We'll send a verification email.</Typography.Text>
                        </div>
                        <RegisterForm />
                        <Typography.Text type="secondary" style={{ textAlign: "center", display: "block" }}>
                            Have an account? <Link to="/login">Log in</Link>
                        </Typography.Text>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}

export function RegisterForm() {
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
        <Form layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form.Item label="Username" name="username" rules={[
                { required: true, message: "Pick a username" },
                { min: 3, message: "At least 3 characters" },
            ]}>
                <Input autoComplete="username" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[
                { required: true, message: "Enter your email" },
                { type: "email", message: "Not a valid email" },
            ]}>
                <Input type="email" autoComplete="email" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[
                { required: true, message: "Choose a password" },
                { min: 6, message: "At least 6 characters" },
            ]}>
                <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block>
                    Create account
                </Button>
            </Form.Item>
            <Divider plain style={{ margin: "24px 0 16px" }}>or</Divider>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                    onSuccess={(resp) => { if (resp.credential) submitGoogle(resp.credential); }}
                    onError={() => setError("Google sign-up failed.")}
                    theme="outline"
                    size="large"
                    width="340"
                    text="signup_with"
                />
            </div>
        </Form>
    );
}
