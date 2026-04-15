import { Alert, Button, Card, Form, Input, Layout, Space, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

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
        <Layout style={{ minHeight: "100dvh", background: "var(--bg)" }}>
            <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <Card style={{ width: "100%", maxWidth: 420 }} variant="outlined">
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <Typography.Title level={3} style={{ margin: 0 }}>Reset password</Typography.Title>
                            <Typography.Text type="secondary">We'll email you a reset link.</Typography.Text>
                        </div>

                        {done ? (
                            <Alert
                                type="success"
                                showIcon
                                message="Check your email"
                                description="If that email is registered, a reset link is on its way. The link expires in 1 hour."
                            />
                        ) : (
                            <Form layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting}>
                                {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                                <Form.Item label="Email" name="email" rules={[
                                    { required: true, message: "Enter your email" },
                                    { type: "email", message: "Not a valid email" },
                                ]}>
                                    <Input type="email" autoComplete="email" />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Button type="primary" htmlType="submit" loading={submitting} block>
                                        Send reset link
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}

                        <Typography.Text type="secondary" style={{ textAlign: "center", display: "block" }}>
                            <Link to="/login">Back to log in</Link>
                        </Typography.Text>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}
