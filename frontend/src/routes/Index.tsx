import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { Link } from "react-router";

export function Index() {
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Epic Blog App
                </Typography.Title>
                <Card>
                    <Link to="/login">
                    log in
                    </Link>
                    <Link to="/register">
                    register
                    </Link>
                </Card>
            </Content>
        </Layout>
    )
}