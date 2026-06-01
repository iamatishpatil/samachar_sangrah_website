import React from 'react';
import { SOCIAL_LINKS } from '../../config';
import { FacebookIcon, TwitterIcon, YouTubeIcon, InstagramIcon, TelegramIcon } from './SocialIcons';

function Footer({ onCategorySelect }) {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-logo">ಸಮಾಚಾರ ಸಂಗ್ರಹ</div>
          <div className="footer-about">
            ಸಮಾಚಾರ ಸಂಗ್ರಹ — ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಸುದ್ದಿ ಜಾಲತಾಣ. ರಾಜ್ಯ, ರಾಷ್ಟ್ರ, ಮತ್ತು ಅಂತರರಾಷ್ಟ್ರೀಯ ಸುದ್ದಿಗಳನ್ನು ನಿಖರವಾಗಿ ಮತ್ತು ತ್ವರಿತವಾಗಿ ತಲುಪಿಸುವ ನಮ್ಮ ಬದ್ಧತೆ.
          </div>
          <div className="footer-social" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><InstagramIcon /></a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><YouTubeIcon /></a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FacebookIcon /></a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><TwitterIcon /></a>
            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><TelegramIcon /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>ವಿಭಾಗಗಳು</h4>
          <a onClick={() => onCategorySelect('ರಾಜ್ಯ')} style={{ cursor: 'pointer' }}>ರಾಜ್ಯ ಸುದ್ದಿ</a>
          <a onClick={() => onCategorySelect('ರಾಷ್ಟ್ರ')} style={{ cursor: 'pointer' }}>ರಾಷ್ಟ್ರೀಯ</a>
          <a onClick={() => onCategorySelect('ಅಂತರರಾಷ್ಟ್ರೀಯ')} style={{ cursor: 'pointer' }}>ಅಂತರರಾಷ್ಟ್ರೀಯ</a>
          <a onClick={() => onCategorySelect('ರಾಜಕೀಯ')} style={{ cursor: 'pointer' }}>ರಾಜಕೀಯ</a>
          <a onClick={() => onCategorySelect('ವ್ಯಾಪಾರ')} style={{ cursor: 'pointer' }}>ವ್ಯಾಪಾರ</a>
          <a onClick={() => onCategorySelect('ಕ್ರೀಡೆ')} style={{ cursor: 'pointer' }}>ಕ್ರೀಡೆ</a>
          <a onClick={() => onCategorySelect('ಮನರಂಜನೆ')} style={{ cursor: 'pointer' }}>ಮನರಂಜನೆ</a>
        </div>
        <div className="footer-col">
          <h4>ಸೇವೆಗಳು</h4>
          <a href="#">ವಿಡಿಯೋ</a>
          <a href="#">ಫೋಟೋ ಗ್ಯಾಲರಿ</a>
          <a href="#">ಪಾಡ್‌ಕಾಸ್ಟ್</a>
          <a href="#">RSS ಫೀಡ್</a>
          <a href="#">ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್</a>
        </div>
        <div className="footer-col">
          <h4>ಸಂಪರ್ಕ</h4>
          <a href="#">ನಮ್ಮ ಬಗ್ಗೆ</a>
          <a href="#">ಜಾಹೀರಾತು</a>
          <a href="#">ಸಂಪರ್ಕಿಸಿ</a>
          <a href="#">ಗೌಪ್ಯತಾ ನೀತಿ</a>
          <a href="#">ನಿಯಮ & ಷರತ್ತುಗಳು</a>
          <a href="#">ತಿದ್ದುಪಡಿ ನೀತಿ</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div>
          <span className="footer-badge">Kannada</span>
          © {new Date().getFullYear()} ಸಮಾಚಾರ ಸಂಗ್ರಹ. ಎಲ್ಲ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿವೆ.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)' }}>
            Developed with ♥ by <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Atish Patil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
