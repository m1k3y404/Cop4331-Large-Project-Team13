const API_BASE_URL = 'http://localhost:5000/api';

export const postService = {
  async createPost(title: string, content: string, creator: string) {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, creator }),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  async getPosts(page = 1, limit = 20) {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
};