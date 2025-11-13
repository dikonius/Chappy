import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import './dashboardPage.css';
import chappyLogo from '../assets/chappy-logo.png';
import { getColorFromName } from '../utils/NameColors';

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);
  const [channelsExpanded, setChannelsExpanded] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      // If no token/user — redirect to GuestPage (or login)
      if (!token || !user) {
        navigate('/login'); 
        return;
      }

      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name || 'user');
      const currentId = parsedUser.id || '';

      try {
        // Fetch public channels
        const channelsRes = await fetch('/api/channel');
        if (!channelsRes.ok) throw new Error('Failed to fetch channels');
        const channelsData = await channelsRes.json();
        setChannels(channelsData.channels || []);

        // Fetch users (authenticated)
        const usersRes = await fetch('/api/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();

        const allUsers = usersData.users || [];
        const filteredUsers = allUsers.filter((u: any) => u.id !== currentId);
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to load data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="loading-placeholder"><p>Loading...</p></div>;
  if (error) return <div className="error-placeholder">{error}</div>;

  const visibleUsers = usersExpanded ? users : users.slice(0, 3);
  const visibleChannels = channelsExpanded ? channels : channels.slice(0, 3);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/profile" className="user-name-btn">{userName}</Link>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Left Sidebar: Users */}
        <aside className="sidebar-users">
          <div className="sidebar-section-header">
            <button className="section-title-btn" onClick={() => setUsersExpanded(!usersExpanded)}>
              All users {usersExpanded ? '▼' : '▲'}
            </button>
          </div>
          <ul className="users-list">
            {visibleUsers.map((user) => (
              <li key={user.id} className="user-item">
                <Link
                  to={`/dm/${user.id}`}
                  className="user-link"
                  style={{ backgroundColor: getColorFromName(user.name) }}
                >
                  <span className="user-name">{user.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <img src={chappyLogo} alt="Chappy dog mascot" className="home-dog-image" />
          <p className="p-dashboard">Select a user or channel to start chatting</p>
        </main>

        {/* Right Sidebar: Channels */}
        <aside className="sidebar-channels">
          <div className="sidebar-section-header">
            <button className="section-title-btn" onClick={() => setChannelsExpanded(!channelsExpanded)}>
              All channels {channelsExpanded ? '▼' : '▲'}
            </button>
          </div>
          <ul className="channels-list">
            {visibleChannels.map((channel) => (
              <li key={channel.id} className={`channel-item ${channel.isLocked ? 'orange' : ''}`}>
                <Link to={`/channel/${channel.id}`} className="channel-link">
                  <span className="channel-name">{channel.name}</span>
                  {/* {channel.isLocked && <span className="lock-icon">🔒</span>} */}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
