import React from 'react';
import { Space, Button, Modal, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import './PostCard.css';
import SentimentGauge from '../Sentiment/SentimentGauge';
import { postService } from '../../services/api';
import { useNavigate } from 'react-router';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
  sentiment?: Record<string, number>;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  creator,
  createdAt,
  sentiment,
}) => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('username');
  const isAuthor = currentUser === creator;

  // rubric requires ONE confirmation modal on delete. Modal.confirm is the only alert -dechante
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({ 
      title: 'Delete this post?',
      content: 'This cannot be undone. The post and its comments will be removed.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await postService.deletePost(id);
          message.success('Post deleted');
          window.location.reload();
        } catch {
          message.error('Failed to delete post (you can only delete your own)');
        }
      },
    });
  };

  return (
    <article className="post-card" onClick={() => navigate(`/post/${id}`)} style={{ cursor: 'pointer' }}>
      <div className="post-header">
        <div>
          <h3>{title}</h3>
          <p className="post-meta">
            by <strong>{creator}</strong> &middot; {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        {isAuthor && (
          <Space onClick={(e) => e.stopPropagation()}>
            <Button icon={<EditOutlined />} type="text" onClick={() => navigate(`/write?id=${id}`)} aria-label="Edit post" />
            <Button icon={<DeleteOutlined />} type="text" danger onClick={handleDelete} aria-label="Delete post" />
          </Space>
        )}
      </div>

      <p className="post-content">{content}</p>

      {sentiment && Object.keys(sentiment).length > 0 && (
        <div className="post-tags">
          {Object.entries(sentiment).map(([tag, value]) => (
            <SentimentGauge key={tag} label={tag} score={value} />
          ))}
        </div>
      )}
    </article>
  );
};

export default PostCard;
