import { Button, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Brand from './Layout/Brand';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');
  const isAuthed = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const linkStyle = (path: string): React.CSSProperties => ({
    color: location.pathname === path ? 'var(--text-h)' : 'var(--text)',
    fontSize: 14,
    textDecoration: 'none',
    padding: '6px 2px',
    borderBottom: location.pathname === path ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
  });

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 48px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Brand size={22} />
      </Link>

      {isAuthed && (
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Link to="/feed" style={linkStyle('/feed')}>Feed</Link>
          <Link to="/search" style={linkStyle('/search')}>Search</Link>
          <Link to="/write" style={linkStyle('/write')}>Write</Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {isAuthed ? (
          <Dropdown
            menu={{
              items: [
                { key: 'user', label: username ?? 'Account', disabled: true, icon: <UserOutlined /> },
                { type: 'divider' },
                { key: 'logout', label: 'Log out', icon: <LogoutOutlined />, onClick: handleLogout },
              ],
            }}
          >
            <Button type="text" style={{ color: 'var(--text-h)', fontSize: 14 }}>
              {username ?? 'Account'}
            </Button>
          </Dropdown>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text)', fontSize: 14, padding: '6px 12px' }}>
              Log in
            </Link>
            <Link to="/register">
              <Button type="primary" size="middle">Get started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
