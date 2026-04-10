import React from 'react';
import { Card, Space, Button, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import './PostCard.css';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
  tags?: string[];
  sentiment?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  creator,
  createdAt,
  tags = [],
  //sentiment,
}) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Post deleted');
        window.location.reload();
      }
    } catch (error) {
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
          <Button icon={<EditOutlined />} type="text" />
          <Button icon={<DeleteOutlined />} type="text" danger onClick={handleDelete} />
        </Space>
      </div>

      <p className="post-content">{content}</p>

      {tags.length > 0 && (
        <div className="post-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PostCard;