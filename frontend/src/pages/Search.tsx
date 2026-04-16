import { useState } from 'react';
import { Input, Card, Empty, Spin, Button, Layout } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import '../assets/Search.css';

const { Content } = Layout;

interface Post {
  _id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
}

export default function Search() {
  useAuth(); // Guard page
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Call your actual API here
      // const response = await fetch(`/api/posts/search?q=${value}`);
      // const data = await response.json();
      // setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '48px' }}>
        <div className="search-header">
          <h1>Search Posts</h1>
          <Input.Search
            placeholder="Search by title or content..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="search-results">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : !searched ? (
            <Empty description="Enter a search term to get started" />
          ) : results.length === 0 ? (
            <Empty description={`No results found for "${query}"`} />
          ) : (
            <div className="results-list">
              {results.map((post) => (
                <Card key={post._id} className="result-card">
                  <div className="result-content">
                    <h3>{post.title}</h3>
                    <p className="result-excerpt">
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 ? '...' : ''}
                    </p>
                    <div className="result-meta">
                      <span className="result-author">By {post.creator}</span>
                      <span className="result-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    Read More
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}