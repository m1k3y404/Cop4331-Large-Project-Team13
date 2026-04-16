const API_BASE_URL = '/api';

export interface IPost {
  _id: string;
  title: string;
  content: string;
  creator: string;
  scores: Record<string, number>;
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PostsResult = { posts: IPost[], total: number, page: number, limit: number };

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem("token")
  },
  getUsername(): string | null {
    return localStorage.getItem("username")
  }
}

export const postService = {
  async createPost(title: string, content: string, creator: string): Promise<IPost> {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + tokenService.getToken() },
      body: JSON.stringify({ title, content, creator }),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json() as IPost;
  },

  async getPosts(page = 1, limit = 20): Promise<PostsResult> {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async getPost(id: string): Promise<IPost> {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return await response.json()
  },

  async deletePost(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + tokenService.getToken() }
    });
    if (!response.ok) throw new Error('Failed to delete post');
  }
};