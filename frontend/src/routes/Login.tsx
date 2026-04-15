import { Button, Divider, Form, Input, Layout, message, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";

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
        const response = await fetch("http://13.projectucf.software:3000/api/users/login", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
        });

        if(response.status == 200) {
            localStorage.setItem("token", "success");
            localStorage.setItem("username", body.username);
            navigate("/feed")
        } else {
            localStorage.removeItem("token");
            messageApi.error("Authentication Failed")
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
            localStorage.removeItem("token");
            messageApi.error("Google Sign-In Failed")
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
        <Divider>or</Divider>
        <Form.Item>
            <GoogleLogin
                onSuccess={(resp) => {
                    if (resp.credential) submitGoogle(resp.credential);
                }}
                onError={() => messageApi.error("Google Sign-In Failed")}
            />
        </Form.Item>
    </Form>
    )
}
