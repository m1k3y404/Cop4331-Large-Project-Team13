import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, Space, message, Spin } from 'antd';
import { SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { postService, type IPost } from '../../services/api';

interface PostEditorProps {
  onSuccess?: (post: IPost) => void;
}

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

export const PostEditor: React.FC<PostEditorProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const id = searchParams.get('id');
  const editing = !!id;

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const post = await postService.getPost(id);
      form.setFieldsValue(post);
      setLoading(false);
    })();
  }, [form, id]);

  const handleSubmit = useCallback(async (values: any) => {
    try {
      setLoading(true);
      const post = editing
        ? await postService.updatePost(id!, values.title, values.content)
        : await postService.createPost(values.title, values.content);
      message.success(editing ? 'Post updated' : 'Post published');
      form.resetFields();
      onSuccess?.(post);
      setTimeout(() => navigate('/feed'), 800);
    } catch (error: any) {
      message.error(error?.response?.data?.error || (editing ? 'Failed to update post' : 'Failed to create post'));
    } finally {
      setLoading(false);
    }
  }, [navigate, form, onSuccess, id, editing]);

  return (
    <div
      className="tilt-editor-shell"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '64px 32px 96px',
        textAlign: 'left',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
        gap: 64,
        alignItems: 'start',
      }}
    >
      <motion.aside
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={0}
        style={{ position: 'sticky', top: 96 }}
      >
        <span className="tilt-kicker">{editing ? 'Editing' : 'New post'}</span>
        <h1 className="tilt-hed" style={{ marginBottom: 20 }}>
          {editing ? <>Rewrite it<span style={{ color: 'var(--accent)' }}>.</span></> : <>Say what you mean<span style={{ color: 'var(--accent)' }}>.</span></>}
        </h1>
        <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.55, maxWidth: '32ch', margin: 0 }}>
          {editing
            ? 'Sharpen the take. Cut the hedging. Your update lands in the feed right after you save.'
            : "Write for one reader, not the algorithm. Short, pointed, honest. You can always edit."}
        </p>
      </motion.aside>

      <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1} className="tilt-panel">
        <Spin spinning={loading}>
          <Form className="tilt-form" form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: 'Please enter a title' },
                { min: 3, message: 'Title must be at least 3 characters' },
              ]}
            >
              <Input placeholder="A headline worth the click..." size="large" maxLength={200} showCount />
            </Form.Item>

            <Form.Item
              name="content"
              label="Body"
              rules={[
                { required: true, message: 'Please enter post content' },
                { min: 10, message: 'Content must be at least 10 characters' },
              ]}
            >
              <Input.TextArea
                placeholder="Write the take. Don't hedge."
                rows={14}
                maxLength={5000}
                showCount
                style={{ fontSize: 15, lineHeight: 1.6 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
              <Space wrap>
                <Button type="primary" icon={<SaveOutlined />} size="large" htmlType="submit" loading={loading}>
                  {editing ? 'Save changes' : 'Publish'}
                </Button>
                <Button icon={<ClearOutlined />} size="large" onClick={() => form.resetFields()}>
                  Clear
                </Button>
                <Button size="large" onClick={() => navigate('/feed')}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </motion.div>
    </div>
  );
};

export default PostEditor;
