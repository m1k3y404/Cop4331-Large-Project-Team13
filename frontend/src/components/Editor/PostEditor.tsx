import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, message, Spin } from 'antd';
import { SaveOutlined, ClearOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import SentimentGauge from '../Sentiment/SentimentGauge';
import { postService } from '../../services/api';
import './PostEditor.css';

interface PostEditorProps {
  onSuccess?: (post: any) => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const creator = localStorage.getItem('username') || 'anonymous';

      const post = await postService.createPost(values.title, values.content, creator);

      if (post.sentimentScore !== undefined) {
        setSentimentScore(post.sentimentScore);
      }

      message.success('Post created successfully!');
      form.resetFields();

      if (onSuccess) {
        onSuccess(post);
      }

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSentimentScore(null);
  };

  return (
    <div className="post-editor-container">
      <Card
        title="Write a New Post"
        className="post-editor-card"
        variant="outlined"
        extra={
          <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Home
          </Button>
        }
      >
        <Spin spinning={loading} description="Publishing...">
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
            <Form.Item
              name="title"
              label="Post Title"
              rules={[
                { required: true, message: 'Please enter a title' },
                { min: 3, message: 'Title must be at least 3 characters' },
              ]}
            >
              <Input
                placeholder="Enter your post title..."
                size="large"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[
                { required: true, message: 'Please enter post content' },
                { min: 10, message: 'Content must be at least 10 characters' },
              ]}
            >
              <Input.TextArea
                placeholder="Write your post content here..."
                rows={12}
                maxLength={5000}
                showCount
              />
            </Form.Item>

            {sentimentScore !== null && <SentimentGauge score={sentimentScore} label="Post Sentiment" />}

            <Form.Item className="form-actions">
              <Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" htmlType="submit" loading={loading}>
                  Publish Post
                </Button>
                <Button icon={<ClearOutlined />} size="large" onClick={handleReset}>
                  Clear
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default PostEditor;