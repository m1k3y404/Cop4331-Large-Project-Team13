import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { Link, useSearchParams } from "react-router";

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");

    let body: React.ReactNode;
    if (status === "success") {
        body = (
            <>
                <Typography.Paragraph>Your email has been verified.</Typography.Paragraph>
                <Link to="/login">Log in</Link>
            </>
        );
    } else if (status === "error") {
        body = (
            <Typography.Paragraph>
                That verification link is invalid or has expired.
            </Typography.Paragraph>
        );
    } else {
        body = (
            <Typography.Paragraph>
                Please check your email to verify it, then log in.
            </Typography.Paragraph>
        );
    }

    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Epic Blog App
                </Typography.Title>
                <Card>{body}</Card>
            </Content>
        </Layout>
    )
}
