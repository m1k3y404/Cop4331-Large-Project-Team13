import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";

export function Feed() {
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Epic Blog App
                </Typography.Title>
                <Card>
                    Welcome to your feed
                </Card>
            </Content>
        </Layout>
    )
}