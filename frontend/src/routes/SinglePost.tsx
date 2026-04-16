import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Skeleton, message, Layout, Space } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { postService, commentService, tokenService, type IPost, type IComment } from '../services/api';
import SentimentGauge from '../components/Sentiment/SentimentGauge';

const { Content } = Layout;

export default function SinglePost() {
  useAuth();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = tokenService.getUsername();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([postService.getPost(id), commentService.list(id)]);
        setPost(p);
        setComments(c);
      } catch {
        message.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const reloadComments = async () => {
    if (!id) return;
    try {
      setComments(await commentService.list(id));
    } catch {
      /* silent */
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setSubmitting(true);
    try {
      await commentService.add(id, newComment.trim());
      setNewComment('');
      await reloadComments();
    } catch {
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePost = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Delete this post?',
      content: 'This cannot be undone. The post and its comments will be removed.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Keep it',
      onOk: async () => {
        try {
          await postService.deletePost(id);
          message.success('Post deleted');
          navigate('/feed');
        } catch {
          message.error('Failed to delete post');
        }
      },
    });
  };

  const confirmDeleteComment = (commentId: string) => {
    Modal.confirm({
      title: 'Delete this comment?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Keep it',
      onOk: async () => {
        try {
          await commentService.remove(commentId);
          await reloadComments();
        } catch {
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const kicker: React.CSSProperties = { display: 'block', fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text)', margin: '0 0 8px' };

  if (loading) {
    return (
      <Layout style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
        <Content>
          <Navbar />
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px' }}>
            <Skeleton active title paragraph={{ rows: 6 }} />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
        <Content>
          <Navbar />
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-h)' }}>Post not found</h2>
            <Button type="primary" onClick={() => navigate('/feed')}>Back to feed</Button>
          </div>
        </Content>
      </Layout>
    );
  }


  return (
    <Layout style={{ background: 'var(--bg)', minHeight: '100dvh', overflowX: 'hidden' }}>
      <Content>
        <Navbar />

        <article style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 16px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/feed')} style={{ color: 'var(--text)', paddingLeft: 0, marginBottom: 24 }}>
            Back to feed
          </Button>

          <span style={kicker}>Post</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <h1 style={{ margin: 0, color: 'var(--text-h)', fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.2px', fontWeight: 500, lineHeight: 1.1 }}>
              {post.title}
            </h1>
            {/* show delete to everyone, backend enforces author check with 403 -dechante */}
            <Button danger icon={<DeleteOutlined />} onClick={confirmDeletePost}>
              Delete
            </Button>
          </div>

          <p style={{ margin: '16px 0 32px', color: 'var(--text)', fontSize: 14 }}>
            by <strong style={{ color: 'var(--text-h)', fontWeight: 500 }}>{post.creator}</strong> &middot;{' '}
            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div style={{ color: 'var(--text-h)', fontSize: 18, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>

          {post.scores && Object.keys(post.scores).length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              {Object.entries(post.scores).map(([tag, value]) => (
                <SentimentGauge key={tag} label={tag} score={value} />
              ))}
            </div>
          )}
        </article>

        <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 96px', borderTop: '1px solid var(--border)' }}>
          <span style={kicker}>Discussion</span>
          <h2 style={{ margin: '0 0 24px', color: 'var(--text-h)', fontSize: 24, fontWeight: 500 }}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </h2>

          <div style={{ display: 'grid', gap: 12, marginBottom: 40 }}>
            <Input.TextArea
              placeholder="Reply with your take..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={1000}
              showCount
            />
            <Space style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <Button type="primary" onClick={handleAddComment} loading={submitting} disabled={!newComment.trim()}>
                Post comment
              </Button>
            </Space>
          </div>

          {comments.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text)', border: '1px dashed var(--border)', borderRadius: 16 }}>
              No comments yet. Start the thread.
            </div>
          ) : (
            <div>
              {comments.map((c) => (
                <div key={c._id} style={{ padding: '20px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-h)', fontWeight: 500, fontSize: 14 }}>{c.creator}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: 'var(--text)', fontSize: 13 }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      {currentUser === c.creator && (
                        <Button type="text" size="small" danger onClick={() => confirmDeleteComment(c._id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-h)', fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </Content>
    </Layout>
  );
}
