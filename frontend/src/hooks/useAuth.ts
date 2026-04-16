import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useAuth() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return
    }
    if(
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      navigate("/feed")
    }
  }, [navigate, pathname]);

  return {
    isAuthenticated: !!localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
  };
}