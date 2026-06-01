import React from 'react';
import { Thumbnail } from './NewsCard';

const WEATHER_DATA = {
  'ಬೆಂಗಳೂರು': { temp: '28°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '82%', wind: '14km/h', low: '22°', icon: '⛅' },
  'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ': { temp: '29°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '79%', wind: '12km/h', low: '21°', icon: '⛅' },
  'ಮೈಸೂರು': { temp: '29°C', desc: 'ಬಿಸಿಲು', humidity: '64%', wind: '10km/h', low: '21°', icon: '☀️' },
  'ಮಂಗಳೂರು': { temp: '31°C', desc: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ', humidity: '90%', wind: '18km/h', low: '26°', icon: '⛈️' },
  'ಹುಬ್ಬಳ್ಳಿ': { temp: '32°C', desc: 'ಬಿಸಿಲು', humidity: '55%', wind: '16km/h', low: '24°', icon: '☀️' },
  'ಧಾರವಾಡ': { temp: '32°C', desc: 'ಬಿಸಿಲು', humidity: '55%', wind: '16km/h', low: '24°', icon: '☀️' },
  'ಬೆಳಗಾವಿ': { temp: '30°C', desc: 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ', humidity: '72%', wind: '15km/h', low: '22°', icon: '☁️' },
  'ಕಲಬುರಗಿ': { temp: '38°C', desc: 'ಹೆಚ್ಚು ಬಿಸಿಲು', humidity: '38%', wind: '12km/h', low: '28°', icon: '☀️' },
  'ಬಾಗಲಕೋಟೆ': { temp: '36°C', desc: 'ಬಿಸಿಲು', humidity: '44%', wind: '13km/h', low: '25°', icon: '☀️' },
  'ಬಳ್ಳಾರಿ': { temp: '37°C', desc: 'ಬಿಸಿಲು', humidity: '42%', wind: '14km/h', low: '27°', icon: '☀️' },
  'ಬೀದರ್': { temp: '35°C', desc: 'ಬಿಸಿಲು', humidity: '46%', wind: '11km/h', low: '24°', icon: '☀️' },
  'ಚಾಮರಾಜನಗರ': { temp: '30°C', desc: 'ಬಿಸಿಲು', humidity: '60%', wind: '9km/h', low: '20°', icon: '☀️' },
  'ಚಿಕ್ಕಬಳ್ಳಾಪುರ': { temp: '29°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '74%', wind: '13km/h', low: '21°', icon: '⛅' },
  'ಚಿಕ್ಕಮಗಳೂರು': { temp: '24°C', desc: 'ತಂಪು ಹವಾಮಾನ / ಜಿಟಿ ಜಿಟಿ ಮಳೆ', humidity: '88%', wind: '11km/h', low: '18°', icon: '🌧️' },
  'ಚಿತ್ರದುರ್ಗ': { temp: '33°C', desc: 'ಬಿಸಿಲು', humidity: '50%', wind: '17km/h', low: '23°', icon: '☀️' },
  'ದಾವಣಗೆರೆ': { temp: '34°C', desc: 'ಬಿಸಿಲು', humidity: '52%', wind: '15km/h', low: '24°', icon: '☀️' },
  'ಗದಗ': { temp: '34°C', desc: 'ಬಿಸಿಲು', humidity: '48%', wind: '14km/h', low: '23°', icon: '☀️' },
  'ಹಾಸನ': { temp: '27°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '75%', wind: '10km/h', low: '19°', icon: '⛅' },
  'ಹಾವೇರಿ': { temp: '33°C', desc: 'ಬಿಸಿಲು', humidity: '54%', wind: '13km/h', low: '23°', icon: '☀️' },
  'ಕೊಡಗು': { temp: '22°C', desc: 'ಧಾರಾಕಾರ ಮಳೆ', humidity: '95%', wind: '10km/h', low: '17°', icon: '🌧️' },
  'ಕೋಲಾರ': { temp: '30°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '70%', wind: '14km/h', low: '21°', icon: '⛅' },
  'ಕೊಪ್ಪಳ': { temp: '36°C', desc: 'ಬಿಸಿಲು', humidity: '45%', wind: '15km/h', low: '25°', icon: '☀️' },
  'ಮಂಡ್ಯ': { temp: '31°C', desc: 'ಬಿಸಿಲು', humidity: '62%', wind: '11km/h', low: '22°', icon: '☀️' },
  'ರಾಯಚೂರು': { temp: '38°C', desc: 'ಹೆಚ್ಚು ಬಿಸಿಲು', humidity: '35%', wind: '13km/h', low: '27°', icon: '☀️' },
  'ರಾಮನಗರ': { temp: '30°C', desc: 'ಭಾಗಶಃ ಮೋಡ', humidity: '78%', wind: '12km/h', low: '21°', icon: '⛅' },
  'शಿವಮೊಗ್ಗ': { temp: '28°C', desc: 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ', humidity: '80%', wind: '12km/h', low: '22°', icon: '☁️' },
  'ತುಮಕೂರು': { temp: '31°C', desc: 'ಬಿಸಿಲು', humidity: '66%', wind: '13km/h', low: '22°', icon: '☀️' },
  'ಉಡುಪಿ': { temp: '31°C', desc: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ', humidity: '92%', wind: '19km/h', low: '25°', icon: '⛈️' },
  'ಉತ್ತರ ಕನ್ನಡ': { temp: '29°C', desc: 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ', humidity: '85%', wind: '16km/h', low: '23°', icon: '☁️' },
  'ವಿಜಯನಗರ': { temp: '36°C', desc: 'ಬಿಸಿಲು', humidity: '43%', wind: '14km/h', low: '26°', icon: '☀️' },
  'ವಿಜಯಪುರ': { temp: '37°C', desc: 'ಹೆಚ್ಚು ಬಿಸಿಲು', humidity: '40%', wind: '15km/h', low: '26°', icon: '☀️' },
  'ಯಾದಗಿರಿ': { temp: '38°C', desc: 'ಹೆಚ್ಚು ಬಿಸಿಲು', humidity: '35%', wind: '14km/h', low: '27°', icon: '☀️' }
};

function Sidebar({ 
  activeCity = 'ಬೆಂಗಳೂರು',
  trendingArticles = [],
  onArticleClick,
  poll,
  selectedPollOption,
  setSelectedPollOption,
  hasVoted,
  onVote,
  pollResults,
  newsletterEmail,
  setNewsletterEmail,
  newsletterMsg,
  onNewsletterSubmit,
  onCategorySelect
}) {
  
  // Render Poll Percentages
  const renderPollResults = () => {
    if (!poll || !pollResults) return null;
    
    const totalVotes = Object.values(pollResults).reduce((sum, v) => sum + v, 0) || 1;

    return poll.options.map((opt, idx) => {
      const votes = pollResults[opt] || 0;
      const percent = Math.round((votes / totalVotes) * 100);
      
      let barColor = 'var(--red)';
      if (idx === 1) barColor = '#f59e0b';
      if (idx === 2) barColor = 'var(--navy)';
      if (idx === 3) barColor = '#6b7280';

      return (
        <div key={opt} className="poll-opt" style={{ opacity: 1, pointerEvents: 'none' }}>
          <div className="poll-label">
            <span>{opt}</span>
            <span>{percent}% ({votes})</span>
          </div>
          <div className="poll-bar-bg">
            <div className="poll-bar-fill" style={{ width: `${percent}%`, backgroundColor: barColor }}></div>
          </div>
        </div>
      );
    });
  };

  // Get active local weather data
  const localWeather = WEATHER_DATA[activeCity] || WEATHER_DATA['ಬೆಂಗಳೂರು'];

  return (
    <aside className="sidebar">
      {/* AD */}
      <div className="ad-box">[ ಜಾಹೀರಾತು 300×250 ]</div>

      {/* TRENDING */}
      <div className="widget">
        <div className="widget-head">
          🔥 ಟ್ರೆಂಡಿಂಗ್ 
          <span className="widget-head-more" onClick={() => onCategorySelect('ಮುಖಪುಟ')} style={{ cursor: 'pointer' }}>
            ಎಲ್ಲಾ →
          </span>
        </div>
        <div className="widget-body">
          {trendingArticles.map((art, idx) => (
            <div key={art.id} className="trend-item" onClick={() => onArticleClick(art)} style={{ cursor: 'pointer' }}>
              <div className="trend-num">{idx + 1}</div>
              <div>
                <div className="trend-title">{art.title}</div>
                <div className="list-meta">🕐 {new Date(art.created_at).toLocaleDateString('kn-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WEATHER */}
      <div className="widget">
        <div className="widget-head">⛅ ಹವಾಮಾನ ({activeCity})</div>
        <div className="weather-box">
          <div className="weather-city">{activeCity}</div>
          <div className="weather-icon">{localWeather.icon}</div>
          <div className="weather-temp">{localWeather.temp}</div>
          <div className="weather-desc">{localWeather.desc}</div>
          <div className="weather-row">
            <div className="weather-sub"><strong>{localWeather.humidity}</strong>ತೇವಾಂಶ</div>
            <div className="weather-sub"><strong>{localWeather.wind}</strong>ಗಾಳಿ</div>
            <div className="weather-sub"><strong>{localWeather.low}</strong>ಕನಿಷ್ಠ</div>
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY */}
      <div className="widget">
        <div className="widget-head">📷 ಫೋಟೋ ಗ್ಯಾಲರಿ</div>
        <div className="gallery-grid">
          <div className="gallery-item" onClick={() => onCategorySelect('ಬೆಂಗಳೂರು')} style={{ cursor: 'pointer' }}>
            <Thumbnail imageUrl="ph ph-red" category="📸" heightClass="75px" />
            <div className="gallery-cap">ಬೆಂಗಳೂರು ಮೆಟ್ರೋ</div>
          </div>
          <div className="gallery-item" onClick={() => onCategorySelect('ರಾಜಕೀಯ')} style={{ cursor: 'pointer' }}>
            <Thumbnail imageUrl="ph ph-blue" category="📸" heightClass="75px" />
            <div className="gallery-cap">ರಾಜ್ಯ ವಿಧಾನಸಭೆ</div>
          </div>
          <div className="gallery-item" onClick={() => onCategorySelect('ಕ್ರೀಡೆ')} style={{ cursor: 'pointer' }}>
            <Thumbnail imageUrl="ph ph-orange" category="📸" heightClass="75px" />
            <div className="gallery-cap">IPL 2025</div>
          </div>
          <div className="gallery-item" onClick={() => onCategorySelect('ಮನರಂಜನೆ')} style={{ cursor: 'pointer' }}>
            <Thumbnail imageUrl="ph ph-green" category="📸" heightClass="75px" />
            <div className="gallery-cap">ಕಾಂತಾರ-2</div>
          </div>
        </div>
      </div>

      {/* POLL */}
      {poll && (
        <div className="widget">
          <div className="widget-head">📊 ಮತದಾನ</div>
          <div className="widget-body">
            <div className="poll-q">{poll.question}</div>
            
            {!hasVoted ? (
              <>
                {poll.options.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '8px 0', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="poll_opt" 
                      value={opt} 
                      checked={selectedPollOption === opt}
                      onChange={(e) => setSelectedPollOption(e.target.value)} 
                    />
                    {opt}
                  </label>
                ))}
                <button 
                  className="poll-vote-btn" 
                  onClick={onVote}
                  disabled={!selectedPollOption}
                >
                  ಮತ ಹಾಕಿ
                </button>
              </>
            ) : (
              <div>
                {renderPollResults()}
                <div style={{ fontSize: '11px', color: 'green', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                  ✅ ಮತ ದಾಖಲಾಗಿದೆ! ಧನ್ಯವಾದಗಳು.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEWSLETTER */}
      <div className="widget">
        <form className="newsletter-box" onSubmit={onNewsletterSubmit}>
          <h3>📧 ನ್ಯೂಸ್‌ಲೆಟರ್ ಚಂದಾ</h3>
          <p>ಪ್ರತಿ ದಿನ ಮುಂಜಾನೆ ಪ್ರಮುಖ ಸುದ್ದಿಗಳನ್ನು ಇ-ಮೇಲ್‌ನಲ್ಲಿ ಪಡೆಯಿರಿ</p>
          <input 
            className="newsletter-input" 
            type="email" 
            placeholder="ನಿಮ್ಮ ಇ-ಮೇಲ್ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            aria-label="ಇಮೇಲ್ ವಿಳಾಸ"
          />
          <button className="newsletter-btn" type="submit">ಚಂದಾ ಹಾಕಿ</button>
          {newsletterMsg.text && (
            <div className="newsletter-msg" style={{ color: newsletterMsg.type === 'success' ? '#a7f3d0' : '#fecaca' }}>
              {newsletterMsg.text}
            </div>
          )}
        </form>
      </div>

      {/* AD 2 */}
      <div className="ad-box" style={{ height: '200px' }}>[ ಜಾಹೀರಾತು 300×200 ]</div>
    </aside>
  );
}

export default Sidebar;
