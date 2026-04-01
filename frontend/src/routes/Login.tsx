import { Button, Form, Input, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";

export function Login() {
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Log In
                </Typography.Title>
                <LoginForm />
            </Content>
        </Layout>
    )
}

export function LoginForm() {
    return (
    <Form>
        <Form.Item label="Username">
            <Input type="text"></Input>
        </Form.Item>
        <Form.Item label="Password">
            <Input type="password"></Input>
        </Form.Item>
        <Form.Item>
            <Button type="primary" htmlType="submit">
                Submit
            </Button>
        </Form.Item>
    </Form>
    )
}