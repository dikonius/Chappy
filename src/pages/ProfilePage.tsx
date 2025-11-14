import React, { useState, useEffect } from 'react';
import '../App.css';
import './homePage.css';
import './profilePage.css';
import { useNavigate } from 'react-router-dom';
import chappyLogo from '../assets/chappy-logo.png';
import LogoutButton from '../components/LogoutButton';
import { useAuthStore } from '../store/useAuthStore';
import LoadingSpinner from '../components/LoadingSpinner';

// 21 predefined BG colors
const bgColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#EE5A24', '#FFA502', '#FF6348', '#32CD32', '#1E90FF',
  '#9370DB', '#FF69B4', '#20B2AA', '#DC143C', '#ADFF2F',
  '#00FA9A',
];

// Only black or white
const textColors = ['#000000', '#FFFFFF'];

const DEFAULT_BG = 'rgba(153, 217, 249, 1)';
const DEFAULT_TEXT = '#000000';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [bgColor, setBgColor] = useState<string>(DEFAULT_BG);
  const [textColor, setTextColor] = useState<string>(DEFAULT_TEXT);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // NEW: loading spinner for hydration
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const { token, user, isGuest } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate before doing anything else
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Apply theme colors globally
  const applyColors = (bg: string, text: string) => {
    document.documentElement.style.setProperty('--profile-bg', bg);
    document.documentElement.style.setProperty('--profile-text', text);
  };

  // Load colors when store is hydrated
  useEffect(() => {
    if (!isHydrated) return;

    // Guest mode → always fallback theme
    if (isGuest || !token) {
      setBgColor(DEFAULT_BG);
      setTextColor(DEFAULT_TEXT);
      applyColors(DEFAULT_BG, DEFAULT_TEXT);
      setPageLoading(false);
      return;
    }

    // Load saved user theme
    try {
      const saved = localStorage.getItem('profileColors');
      if (saved) {
        const { bg, text } = JSON.parse(saved);

        const safeBg = bg || DEFAULT_BG;
        const safeText = textColors.includes(text) ? text : DEFAULT_TEXT;

        setBgColor(safeBg);
        setTextColor(safeText);
        applyColors(safeBg, safeText);
      } else {
        applyColors(DEFAULT_BG, DEFAULT_TEXT);
      }
    } catch (err) {
      console.error('Profile - Failed to load saved colors:', err);
      applyColors(DEFAULT_BG, DEFAULT_TEXT);
    }

    setPageLoading(false);
  }, [isHydrated, token, user, isGuest]);

  // Handle selecting a color
  const handleColorChange = (type: 'bg' | 'text', color: string) => {
    if (isGuest) return; // guests cannot update

    if (type === 'bg') {
      setBgColor(color);
      applyColors(color, textColor);
    }

    if (type === 'text' && textColors.includes(color)) {
      setTextColor(color);
      applyColors(bgColor, color);
    }
  };

  // Save to localStorage
  const handleSave = async () => {
    if (isGuest) return;

    setIsSaving(true);
    try {
      localStorage.setItem(
        'profileColors',
        JSON.stringify({ bg: bgColor, text: textColor })
      );
      console.log('Profile - Colors saved!');
    } catch (err) {
      console.error('Profile - Save error:', err);
    }
    setIsSaving(false);
  };

  // 🔥 SHOW SPINNER WHILE LOADING COLORS
  if (pageLoading) {
    return (
      <div className="loading-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-left-panel">
        <img src={chappyLogo} alt="Chappy logo" className="home-dog-image" />
      </div>

      <div className="profile-right-panel">
        <h2 className="profile-h2">Profile Settings</h2>

        <div className="user-name-display">
          <span className="user-name-btn">{user?.name || 'guest'}</span>
        </div>

        <LogoutButton />

        {/* Background Colors */}
        <p className="profile-color-label">Background Color</p>
        <div className="color-section">
          <div className="color-palette">
            {bgColors.map((color) => (
              <label key={color} className="color-radio-label">
                <input
                  type="radio"
                  name="bgColor"
                  value={color}
                  checked={bgColor === color}
                  onChange={(e) =>
                    handleColorChange('bg', e.target.value)
                  }
                  disabled={isGuest}
                />
                <span
                  className="color-radio-btn"
                  style={{ backgroundColor: color }}
                ></span>
              </label>
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <p className="profile-color-label">Text Color</p>
        <div className="color-section">
          <div className="color-palette">
            {textColors.map((color) => (
              <label key={color} className="color-radio-label">
                <input
                  type="radio"
                  name="textColor"
                  value={color}
                  checked={textColor === color}
                  onChange={(e) =>
                    handleColorChange('text', e.target.value)
                  }
                  disabled={isGuest}
                />
                <span
                  className="color-radio-btn"
                  style={{
                    backgroundColor: color === '#000000' ? '#000' : '#fff',
                  }}
                ></span>
              </label>
            ))}
          </div>
        </div>

        <button
          className="home-button primary"
          onClick={handleSave}
          disabled={isSaving || isGuest}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          className="home-button secondary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
