import { useState } from 'react';
import { Skeleton, Button, Layout, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import SearchBar from '../components/Search/SearchBar';
import { postService, type IPost } from '../services/api';

const { Content } = Layout;

const CHIPS = ['politics', 'art', 'code', 'books', 'quiet takes', 'long reads'];

export default function Search() {
  useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const runSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const response = await postService.searchPosts(value);
      setResults(response.posts);
    } catch {
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="tilt-page">
      <Content>
        <Navbar />
        <div className="tilt-shell">
          <span className="tilt-kicker">Search</span>
          <h1 className="tilt-hed" style={{ marginBottom: 28 }}>
            Find what's been written<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>

          <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => runSearch(chip)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-h)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            {loading ? (
              <div>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ padding: '20px 0', borderTop: '1px solid var(--border)' }}>
                    <Skeleton active title paragraph={{ rows: 2 }} />
                  </div>
                ))}
              </div>
            ) : !searched ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20, color: 'var(--text)' }}>
                <SearchOutlined style={{ fontSize: 28, color: 'var(--accent)', marginBottom: 12 }} />
                <p style={{ margin: 0 }}>Type a word, pick a chip, or hit enter.</p>
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 20, color: 'var(--text)' }}>
                <p style={{ margin: 0 }}>
                  No results for <strong style={{ color: 'var(--text-h)' }}>"{query}"</strong>.
                </p>
              </div>
            ) : (
              <div>
                {results.map((post) => (
                  <article
                    key={post._id}
                    onClick={() => navigate(`/post/${post._id}`)}
                    style={{ padding: '24px 0', borderTop: '1px solid var(--border)', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: 'var(--text-h)', letterSpacing: '-0.3px' }}>
                        {post.title}
                      </h3>
                      <p style={{ margin: '6px 0', color: 'var(--text)', fontSize: 15, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.content}
                      </p>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>
                        by <strong style={{ color: 'var(--text-h)', fontWeight: 500 }}>{post.creator}</strong> &middot; {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button type="text" onClick={(e) => { e.stopPropagation(); navigate(`/post/${post._id}`); }}>
                      Read
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
