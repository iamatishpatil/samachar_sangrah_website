import React from 'react';
import { SOCIAL_LINKS } from '../../config';
import { FacebookIcon, TwitterIcon, YouTubeIcon, InstagramIcon } from './SocialIcons';

// Utility helper to format date in Kannada
const getKannadaDate = () => {
  const dayNames = ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'];
  const monthNames = [
    'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್',
    'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'
  ];
  
  const toKannadaDigits = (num) => {
    const digits = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];
    return num.toString().split('').map(d => digits[parseInt(d)] || d).join('');
  };

  const now = new Date();
  const day = dayNames[now.getDay()];
  const date = toKannadaDigits(now.getDate());
  const month = monthNames[now.getMonth()];
  const year = toKannadaDigits(now.getFullYear());
  
  return `${day}, ${date} ${month} ${year}`;
};

function TopBar({ navigate }) {
  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-left">
          <a href="#">ಜಾಹೀರಾತು</a>
          <span className="topbar-divider">|</span>
          <a href="#">ನಮ್ಮ ಬಗ್ಗೆ</a>
          <span className="topbar-divider">|</span>
          <a href="#">ಸಂಪರ್ಕಿಸಿ</a>
        </div>
        <div className="topbar-right">
          <div className="topbar-date">{getKannadaDate()} | ಬೆಂಗಳೂರು ☀ 28°C</div>
          <div className="social-icons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><InstagramIcon /></a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><YouTubeIcon /></a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FacebookIcon /></a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><TwitterIcon /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
