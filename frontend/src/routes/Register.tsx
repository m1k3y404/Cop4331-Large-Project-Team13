import { Button, Form, Input, Layout, message, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback } from "react";
import { useNavigate } from "react-router";

export function Register() {
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Register
                </Typography.Title>
                <RegisterForm />
            </Content>
        </Layout>
    )
}

type RegisterBody = {username: string, email: string, password: string}

export function RegisterForm() {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate()

    const submit = useCallback(async (body: RegisterBody) => {
        const response = await fetch("/api/users/register", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
        });

        if(response.status == 201) {
            navigate("/verify-email")
        } else {
            messageApi.error("Registration Failed")
        }
    }, [messageApi, navigate]);

    return (
    <Form onFinish={submit}>
        {contextHolder}
        <Form.Item label="Username" name="username">
            <Input type="text"></Input>
        </Form.Item>
        <Form.Item label="Email" name="email">
            <Input type="email"></Input>
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
