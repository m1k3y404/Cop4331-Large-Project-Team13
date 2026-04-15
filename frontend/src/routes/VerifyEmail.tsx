import { Card, Layout, Result, Space, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { CheckCircleFilled, CloseCircleFilled, MailOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router";

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");

    let body: React.ReactNode;

    if (status === "success") {
        body = (
            <Result
                icon={<CheckCircleFilled style={{ color: "#22c55e" }} />}
                status="success"
                title="Email verified"
                subTitle="Your account is ready. You can log in now."
                extra={<Link to="/login">Go to log in</Link>}
            />
        );
    } else if (status === "error") {
        body = (
            <Result
                icon={<CloseCircleFilled style={{ color: "#ef4444" }} />}
                status="error"
                title="Link invalid or expired"
                subTitle="Request a new verification email by registering again, or contact support."
                extra={<Link to="/register">Back to register</Link>}
            />
        );
    } else {
        body = (
            <Space direction="vertical" size="middle" align="center" style={{ width: "100%", textAlign: "center" }}>
                <MailOutlined style={{ fontSize: 48, color: "var(--accent, #aa3bff)" }} />
                <Typography.Title level={3} style={{ margin: 0 }}>Check your email</Typography.Title>
                <Typography.Text type="secondary">
                    We sent you a verification link. Click it to activate your account, then log in.
                </Typography.Text>
                <Link to="/login">Back to log in</Link>
            </Space>
        );
    }

    return (
        <Layout style={{ minHeight: "100dvh", background: "var(--bg)" }}>
            <Content style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <Card style={{ width: "100%", maxWidth: 480 }} variant="outlined">
                    {body}
                </Card>
            </Content>
        </Layout>
    );
}
