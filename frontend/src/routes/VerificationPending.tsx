import { Card, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function VerificationPending() {
    const navigate = useNavigate();
    const [searchParams,] = useSearchParams();

    useEffect(() => {
        const username = searchParams.get("username");
        if(!username) {
            return;
        }

        const pollVerified = async () => {
            const req = await fetch("/api/users/user/" + encodeURIComponent(username));
            const user = await req.json();
            if(user.isVerified) {
                navigate("/")
            }
        }

        setInterval(pollVerified, 10*1000)
    }, [searchParams, navigate]);
    
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