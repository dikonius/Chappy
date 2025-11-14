import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './dashboardPage.css';
import './homePage.css'
import chappyLogo from '../assets/chappy-logo.png';
import { getColorFromName } from '../utils/NameColors';
import { useAuthStore } from '../store/useAuthStore';

const GuestPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usersExpanded, setUsersExpanded] = useState<boolean>(false);
  const [channelsExpanded, setChannelsExpanded] = useState<boolean>(false);

  const { token } = useAuthStore();

  // Fetch users and channels on mount
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

        // Fetch users - try with or without token
        const usersRes = await fetch('/api/user', {
          ...(token && { headers: { 'Authorization': `Bearer ${token}` } })
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        } else {
          console.log('Users fetch failed – showing empty');
          setUsers([]);
        }
      } catch (err) {
        setError('Failed to load data: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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
          <Link to="/login" className="guest-btn">guest</Link>
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
        {visibleUsers.map((user) => (
          <li key={user.id} className="user-item disabled">
            <button
              className="user-link"
              style={{
                backgroundColor: getColorFromName(user.name),
              }}
              disabled
            >
              <span className="user-name">{user.name}</span>
            </button>
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
            {visibleChannels.map((channel) => {
              const isLocked = channel.isLocked;
              const disabled = isLocked;

              return (
                <li
                  key={channel.id}
                  className={`channel-item ${isLocked ? 'locked disabled-item' : ''}`}
                >
                  {disabled ? (
                    <button
                      className="channel-link disabled"
                      disabled
                    >
                      <span className="channel-name">{channel.name}</span>
                      {isLocked && <span className="lock-icon">🔒</span>}
                    </button>
                  ) : (
                    <Link to={`/channel/${channel.id}`} className="channel-link">
                      <span className="channel-name">{channel.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default GuestPage;