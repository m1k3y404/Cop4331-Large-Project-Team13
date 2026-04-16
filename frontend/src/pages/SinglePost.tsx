import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Card, Button, Input, Space, Modal, Spin, Empty, message, Layout } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import '../assets/SinglePost.css';

const { Content } = Layout;

interface Post {
  _id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
  userId?: string;
}

interface Comment {
  _id: string;
  content: string;
  creator: string;
  createdAt: string;
  userId?: string;
}

export default function SinglePost() {
  useAuth(); // Guard page
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId || '');

    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      // Call your actual API here
      // const response = await fetch(`/api/posts/${id}`);
      // const data = await response.json();
      // setPost(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      message.error('Failed to load post');
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Call your actual API here
      // const response = await fetch(`/api/posts/${id}/comments`);
      // const data = await response.json();
      // setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      // Call your actual API here
      // await fetch(`/api/posts/${id}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment })
      // });
      
      setNewComment('');
      fetchComments();
      message.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Error adding comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Modal.confirm({
      title: 'Delete Comment',
      content: 'Are you sure you want to delete this comment?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // Call your actual API here
          // await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
          
          fetchComments();
          message.success('Comment deleted');
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Error deleting comment');
        }
      },
    });
  };

  const handleDeletePost = () => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // Call your actual API here
          // await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          
          message.success('Post deleted');
          navigate('/feed');
        } catch (error) {
          console.error('Failed to delete post:', error);
          message.error('Error deleting post');
        }
      },
    });
  };

  if (loading) {
    return (
      <Layout>
        <Content style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Content style={{ padding: '48px' }}>
          <Empty description="Post not found" />
        </Content>
      </Layout>
    );
  }

  const isAuthor = currentUserId === post.userId;

  return (
    <Layout>
      <Content style={{ padding: '48px' }}>
        <Card className="single-post-card">
          <div className="post-header">
            <h1>{post.title}</h1>
            {isAuthor && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeletePost}
              >
                Delete Post
              </Button>
            )}
          </div>

          <div className="post-meta">
            <span className="author">By {post.creator}</span>
            <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="post-content">{post.content}</div>
        </Card>

        <Card className="comments-card">
          <h2>Comments ({comments.length})</h2>

          <div className="add-comment">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Input.TextArea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                type="primary"
                onClick={handleAddComment}
                loading={submitting}
                style={{ alignSelf: 'flex-end' }}
              >
                Post Comment
              </Button>
            </Space>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <Empty description="No comments yet. Be the first to comment!" />
            ) : (
              comments.map((comment) => (
                <Card key={comment._id} className="comment-item" size="small">
                  <div className="comment-header">
                    <span className="comment-author">{comment.creator}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {currentUserId === comment.userId && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </Card>
              ))
            )}
          </div>
        </Card>
      </Content>
    </Layout>
  );
}