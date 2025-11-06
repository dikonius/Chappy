import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // For navigation to channels/DMs
import '../App.css';
import './dashboardPage.css';  // Import the new CSS
import chappyLogo from '../assets/chappy-logo.png';
import { getColorFromName } from '../utils/NameColors';

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('guest');  // Default 'guest'
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);  // Toggle for users
  const [channelsExpanded, setChannelsExpanded] = useState<boolean>(false);  // Toggle for channels

  // Load userName and fetch data (merged useEffect)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Load userName from localStorage
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      let currentId = '';
      if (token && user) {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || 'user');
        currentId = parsedUser.id || '';
      } else {
        setUserName('guest');
      }

      try {
        // Fetch channels (public)
        const channelsRes = await fetch('/api/channel');
        if (!channelsRes.ok) {
          throw new Error('Failed to fetch channels');
        }
        const channelsData = await channelsRes.json();
        setChannels(channelsData.channels || []);

        // Fetch users (protected – add Authorization header if token available)
        const usersRes = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();
        const allUsers = usersData.users || [];
        // Filter out the current logged-in user
        const filteredUsers = allUsers.filter((user: any) => user.id !== currentId);
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to load data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);  // Empty dependency array: only run on initial mount

  if (loading) {
    return <div className="loading-placeholder"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="error-placeholder">{error}</div>;
  }

  // Show only first 3 by default
  const visibleUsers = usersExpanded ? users : users.slice(0, 3);
  const visibleChannels = channelsExpanded ? channels : channels.slice(0, 3);

  return (
    <div className="dashboard-page">
      {/* Header – Dynamic user name ("guest" or logged-in name) */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/profile" className="user-name-btn">{userName}</Link>
        </div>
        <div className="header-right">
        </div>
      </header>

      <div className="dashboard-main">
        {/* Left Sidebar: Users (no avatars/status, exclude self) */}
        <aside className="sidebar-users">
          <div className="sidebar-section-header">
            <button className="section-title-btn" onClick={() => setUsersExpanded(!usersExpanded)}>
              All users {usersExpanded ? '▼' : '▲'}
            </button>
          </div>
          <ul className="users-list">
            {visibleUsers.map((user) => (
              <li key={user.id} className="user-item">
                <Link to={`/dm/${user.id}`} className="user-item" style={{ backgroundColor: getColorFromName(user.name) }}>
                  <span className="user-name">{user.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
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
              <li key={channel.id} className={`channel-item ${channel.isLocked ? 'locked' : ''}`}>
                <Link to={`/channel/${channel.id}`} className="channel-link">
                  <span className="channel-name">{channel.name}</span>
                  {channel.isLocked && <span className="lock-icon">🔒</span>}
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