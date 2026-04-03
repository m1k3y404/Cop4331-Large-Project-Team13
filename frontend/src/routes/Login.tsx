import { Button, Form, Input, Layout, message, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback } from "react";
import { redirect, useNavigate } from "react-router";

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

type AuthBody = {username: string, password: string}

export function LoginForm() {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate()

    const submit = useCallback(async (body: AuthBody) => {
        const response = await fetch("/api/users/login", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
        });

        if(response.status == 200) {
            localStorage.setItem("token", "success");
            navigate("/feed")
        } else {
            localStorage.removeItem("token");
            messageApi.error("Authentication Failed")
        }
    }, [messageApi, navigate]);
    return (
    <Form onFinish={submit}>
        {contextHolder}
        <Form.Item label="Username" name="username">
            <Input type="text"></Input>
        </Form.Item>
        <Form.Item label="Password" name="password">
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