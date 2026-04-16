import React, { useEffect, useState } from 'react';
import { Layout, Button, Space, Skeleton, message } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import PostCard from '../components/Feed/PostCard';
import TiltMenu from '../components/TiltMenu/TiltMenu';
import { postService, type IPost, type ScoreFilter } from '../services/api';
import '../assets/Feed.css';
import Navbar from '../components/Navbar';

const { Content } = Layout;

export function Feed() {
  return (
    <Layout style={{ background: 'var(--bg)', minHeight: '100dvh', overflowX: 'hidden' }}>
      <Content>
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <Navbar />
        </div>
        <Body />
      </Content>
    </Layout>
  );
}

const Body: React.FC = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<ScoreFilter[]>([]);
  const navigate = useNavigate();

  const fetchPosts = async (filters: ScoreFilter[]) => {
    try {
      setLoading(true);
      const data =
        filters.length === 0
          ? await postService.getPosts()
          : await postService.getPostsByScores(filters);
      setPosts(data.posts || []);
    } catch {
      message.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(appliedFilters);
  }, [appliedFilters]);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 32px 80px" }}>
      <div className="feed-header">
        <div>
          <span className="feed-kicker">What people wrote</span>
          <h1>Your feed</h1>
        </div>
        <Space wrap>
          <TiltMenu
            appliedFilters={appliedFilters}
            availableLabels={['optimism', 'nsfw']}
            onApply={setAppliedFilters}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchPosts(appliedFilters)}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/write')}>
            New post
          </Button>
        </Space>
      </div>

      {loading ? (
        <div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="feed-skeleton-row">
              <Skeleton active title={{ width: `${60 + i * 10}%` }} paragraph={{ rows: 2, width: ['100%', '70%'] }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-empty">
          <EditOutlined style={{ fontSize: 32, color: "var(--accent)" }} />
          <h3>Nothing in your feed yet</h3>
          <p style={{ margin: "0 auto 24px", maxWidth: "36ch" }}>
            {appliedFilters.length > 0
              ? "No posts match the filters you picked. Try loosening them or clearing filters."
              : "Write the first post and set the tone for tilt."}
          </p>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/write')}>
            Write a post
          </Button>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              id={post._id}
              title={post.title}
              content={post.content}
              creator={post.creator}
              createdAt={post.createdAt.toString()}
              sentiment={post.scores}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;