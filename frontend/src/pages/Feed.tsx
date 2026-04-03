import React, { useEffect, useState } from 'react';
import { Layout, Button, Space, Spin, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import PostCard from '../components/Feed/PostCard';
import { postService } from '../services/api';
import './Feed.css';

const { Content } = Layout;

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts();
      setPosts(data.posts || []);
    } catch (error) {
      message.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Layout>
      <Content style={{ padding: '48px' }}>
        <div className="feed-header">
          <h1>Posts Feed</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchPosts}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/write')}>
              New Post
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          {posts.length === 0 ? (
            <p>No posts yet. Be the first to create one!</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                title={post.title}
                content={post.content}
                creator={post.creator}
                createdAt={post.createdAt}
                tags={post.tags}
                sentiment={post.sentimentScore}
              />
            ))
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default Feed;