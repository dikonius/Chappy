import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // For navigation to channels/DMs
import '../App.css';
import './dashboardPage.css';  // Import the new CSS
import chappyLogo from '../assets/chappy-logo.png';

const GuestPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);  // Toggle for users
  const [channelsExpanded, setChannelsExpanded] = useState<boolean>(false);  // Toggle for channels
  const userName = 'guest';  // Hardcoded 'guest' for GuestPage

  // Fetch users and channels on mount (users optional for guests)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch channels (public)
        const channelsRes = await fetch('/api/channel');
        if (!channelsRes.ok) {
          throw new Error('Failed to fetch channels');
        }
        const channelsData = await channelsRes.json();
        setChannels(channelsData.channels || []);

        // Fetch users (protected – try with token if available, else skip)
        const token = localStorage.getItem('token');
        if (token) {
          const usersRes = await fetch('/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.users || []);
          } else {
            console.log('Users fetch failed for guest (expected if no token) – showing empty');
            setUsers([]);  // Empty for guest, or fetch public users if endpoint updated
          }
        } else {
          setUsers([]);  // No token = guest, show empty or public list if backend allows
        }
      } catch (err) {
        setError('Failed to load data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* Header – Hardcoded 'guest' name */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="user-name-btn">{userName}</button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Left Sidebar: Users (empty or limited for guest) */}
        <aside className="sidebar-users">
          <div className="sidebar-section-header">
            <button className="section-title-btn" onClick={() => setUsersExpanded(!usersExpanded)}>
              All users {usersExpanded ? '▼' : '▲'}
            </button>
          </div>
          <ul className="users-list">
            {visibleUsers.length > 0 ? (
              visibleUsers.map((user) => (
                <li key={user.id} className="user-item">
                  <Link to={`/dm/${user.id}`} className="user-link">
                    <span className="user-name">{user.name}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="empty-list">
                <p>Login to see users</p>
              </li>
            )}
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

export default GuestPage;