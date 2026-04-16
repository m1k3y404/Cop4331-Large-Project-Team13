import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { useNavigate } from 'react-router';
import { LogoutOutlined, HomeOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import '../assets/Navbar.css';

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="user" disabled>
        👤 {username}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: '#001529',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
        📝 Blog
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        style={{ flex: 1, justifyContent: 'center' }}
        onClick={(e) => {
          if (e.key === 'feed') navigate('/feed');
          if (e.key === 'search') navigate('/search');
          if (e.key === 'write') navigate('/write');
        }}
      >
        <Menu.Item key="feed" icon={<HomeOutlined />}>
          Feed
        </Menu.Item>
        <Menu.Item key="search" icon={<SearchOutlined />}>
          Search
        </Menu.Item>
        <Menu.Item key="write" icon={<FileTextOutlined />}>
          Write Post
        </Menu.Item>
      </Menu>

      <Dropdown menu={{ items: [{ key: 'user', label: `👤 ${username}`, disabled: true }, { type: 'divider' }, { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }] }}>
        <Button type="text" style={{ color: 'white' }}>
          Hello, {username}!
        </Button>
      </Dropdown>
    </Header>
  );
}