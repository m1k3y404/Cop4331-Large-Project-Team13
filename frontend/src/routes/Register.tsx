import { Button, Divider, Form, Input, Layout, message, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";

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
        const response = await fetch("http://13.projectucf.software:3000/api/users/register", {
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

    const submitGoogle = useCallback(async (credential: string) => {
        const response = await fetch("http://13.projectucf.software:3000/api/users/google", {
            method: "POST",
            body: JSON.stringify({ credential }),
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.status == 200) {
            const data = await response.json();
            localStorage.setItem("token", "success");
            localStorage.setItem("username", data.username);
            navigate("/feed")
        } else {
            messageApi.error("Google Sign-Up Failed")
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
        <Divider>or</Divider>
        <Form.Item>
            <GoogleLogin
                onSuccess={(resp) => {
                    if (resp.credential) submitGoogle(resp.credential);
                }}
                onError={() => messageApi.error("Google Sign-Up Failed")}
            />
        </Form.Item>
    </Form>
    )
}
