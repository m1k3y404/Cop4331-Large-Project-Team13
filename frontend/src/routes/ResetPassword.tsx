import { Alert, Button, Card, Form, Input, Layout, Space, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://13.projectucf.software:3000";

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
        <Layout style={{ minHeight: "100dvh", background: "var(--bg)" }}>
            <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <Card style={{ width: "100%", maxWidth: 420 }} variant="outlined">
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <Typography.Title level={3} style={{ margin: 0 }}>Choose a new password</Typography.Title>
                            <Typography.Text type="secondary">Use at least 6 characters.</Typography.Text>
                        </div>

                        {!token && (
                            <Alert
                                type="warning"
                                showIcon
                                message="No token in link"
                                description="This page needs a ?token=... from your reset email."
                            />
                        )}

                        <Form layout="vertical" onFinish={submit} requiredMark={false} disabled={submitting || !token}>
                            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                            <Form.Item label="New password" name="newPassword" rules={[
                                { required: true, message: "Enter a new password" },
                                { min: 6, message: "At least 6 characters" },
                            ]}>
                                <Input.Password autoComplete="new-password" />
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
                                <Input.Password autoComplete="new-password" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit" loading={submitting} block>
                                    Reset password
                                </Button>
                            </Form.Item>
                        </Form>

                        <Typography.Text type="secondary" style={{ textAlign: "center", display: "block" }}>
                            <Link to="/login">Back to log in</Link>
                        </Typography.Text>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}
