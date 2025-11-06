import React, { useState, useEffect } from 'react';
import '../App.css';
import './homePage.css';
import './profilePage.css';
import { useNavigate } from 'react-router-dom';
import chappyLogo from '../assets/chappy-logo.png';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [bgColor, setBgColor] = useState<string>('rgba(153, 217, 249, 1)');  // Fallback light blue
  const [textColor, setTextColor] = useState<string>('#000000');  // Fallback black
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);  // Check guest mode

  // 21 predefined colors for BG only
  const bgColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#EE5A24', '#FFA502', '#FF6348', '#32CD32', '#1E90FF',
    '#9370DB', '#FF69B4', '#20B2AA', '#DC143C', '#ADFF2F',
    '#00FA9A',
  ];

  // Text colors: Only black or white
  const textColors = ['#000000', '#FFFFFF'];

  // Load saved colors from localStorage on mount, fallback for guests only
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsGuest(!token);

    if (!token) {
      // Guests always use fallback
      setBgColor('rgba(153, 217, 249, 1)');
      setTextColor('#000000');
      applyColors('rgba(153, 217, 249, 1)', '#000000');
      return;
    }

    try {
      const saved = localStorage.getItem('profileColors');
      if (saved) {
        const { bg, text } = JSON.parse(saved);
        setBgColor(bg || 'rgba(153, 217, 249, 1)');
        setTextColor(textColors.includes(text) ? text : '#000000');
        applyColors(bg || 'rgba(153, 217, 249, 1)', textColors.includes(text) ? text : '#000000');
      } else {
        applyColors('rgba(153, 217, 249, 1)', '#000000');
      }
    } catch (error) {
      console.error('Profile - localStorage parse error:', error);
      applyColors('rgba(153, 217, 249, 1)', '#000000');
    }
  }, []);

  // Apply colors to CSS variables (global)
  const applyColors = (bg: string, text: string) => {
    document.documentElement.style.setProperty('--profile-bg', bg);
    document.documentElement.style.setProperty('--profile-text', text);
  };

  const handleColorChange = (type: 'bg' | 'text', color: string) => {
    if (isGuest) return;  // Block changes for guests

    if (type === 'bg') {
      setBgColor(color);
      applyColors(color, textColor);
    } else {
      // Text only black or white
      if (color === '#000000' || color === '#FFFFFF') {
        setTextColor(color);
        applyColors(bgColor, color);
      }
    }
  };

  const handleSave = async () => {
    if (isGuest) return;  // Guests can't save

    setIsSaving(true);
    try {
      localStorage.setItem('profileColors', JSON.stringify({ bg: bgColor, text: textColor }));
      console.log('Profile - Colors saved!');
    } catch (error) {
      console.error('Profile - Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-left-panel">
        <img src={chappyLogo} alt="Chappy logo" className="home-dog-image" />
      </div>
      <div className="home-right-panel">
        <h2 className='profile-h2'>Profile Settings</h2>
        
        <p className='profile-color-label'>Current Background Color</p>
        <input
            className='color-input'
            type="color"
            value={bgColor}
            onChange={(e) => handleColorChange('bg', e.target.value)}
            disabled={isGuest}
          />
        <div className="color-section">
          
          <div className="color-palette">
            {bgColors.map((color) => (
              <label key={color} className="color-radio-label">
                <input
                  type="radio"
                  name="bgColor"
                  value={color}
                  checked={bgColor === color}
                  onChange={(e) => handleColorChange('bg', e.target.value)}
                  disabled={isGuest}
                />
                <span className="color-radio-btn" style={{ backgroundColor: color }}></span>
              </label>
            ))}
          </div>
          
        </div>
        
        <p className='profile-color-label'>Current Text Color</p>
        <input
            className='color-input'
            type="color"
            value={textColor}
            onChange={(e) => handleColorChange('text', e.target.value)}
            disabled={isGuest}
          />
        <div className="color-section">
          <div className="color-palette">
            {textColors.map((color) => (
              <label key={color} className="color-radio-label">
                <input
                  type="radio"
                  name="textColor"
                  value={color}
                  checked={textColor === color}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  disabled={isGuest}
                />
                <span className="color-radio-btn" style={{ backgroundColor: color === '#000000' ? '#fff' : '#000', color }}></span>
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