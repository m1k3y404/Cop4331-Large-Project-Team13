import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";

export function VerifyEmail() {
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Epic Blog App
                </Typography.Title>
                <Card>
                    Please check your email to verify it, then log in
                </Card>
            </Content>
        </Layout>
    )
}