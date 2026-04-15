import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function VerifyEmail() {
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Verification in progress...");

    const token = searchParams.get("token");
    if(!token) {
        setMessage("Verification failed.")
    }

    const verify = useCallback(async () => {
        const verify_url = new URL("/api/users/verify-email");
        verify_url.searchParams.set("token", token as string);

        const response = await fetch(verify_url);
        if(response.ok) {
            navigate("/login")
        } else {
            setMessage("Verification failed.")
        }
    }, [setMessage, navigate, token])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        verify()
    }, [verify]);
    
    return (
        <Layout>
            <Content style={{padding: '48px'}}>
                <Typography.Title level={2}>
                    Epic Blog App
                </Typography.Title>
                <Card>
                    {message}
                </Card>
            </Content>
        </Layout>
    )
}