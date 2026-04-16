import React from 'react';
import { Card, Space, Button, message } from 'antd';
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
  const handleDelete = async () => {
    try {
      await postService.deletePost(id);
      message.success('Post deleted');
      window.location.reload();
    } catch {
      message.error('Failed to delete post');
    }
  };

  return (
    <Card className="post-card">
      <div className="post-header">
        <div>
          <h3>{title}</h3>
          <p className="post-meta">
            by <strong>{creator}</strong> • {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <Space>
          <Button icon={<EditOutlined />} type="text" onClick={() => navigate(`/write?id=${id}`)}/>
          <Button icon={<DeleteOutlined />} type="text" danger onClick={handleDelete} />
        </Space>
      </div>

      <p className="post-content">{content}</p>

      {sentiment && (
        <div className="post-tags">
          {Object.entries(sentiment).map(([tag, value]) => (
            <SentimentGauge label={tag} score={value} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default PostCard;