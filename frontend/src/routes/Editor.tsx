import { Layout } from 'antd';
import PostEditor from '../components/Editor/PostEditor';
import { Content } from 'antd/es/layout/layout';
import Navbar from '../components/Navbar';


export function Editor() {
    return (
        <Layout style={{ background: "var(--bg)", minHeight: "100dvh", overflowX: "hidden" }}>
            <Content>
                <Navbar />
                <PostEditor />
            </Content>
        </Layout>
    );
}

export default Editor;