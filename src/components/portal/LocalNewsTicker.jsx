import React, { useState, useEffect } from 'react';

const DISTRICT_MAP = {
  'bengaluru': 'ಬೆಂಗಳೂರು',
  'bangalore': 'ಬೆಂಗಳೂರು',
  'bengaluru urban': 'ಬೆಂಗಳೂರು',
  'bengaluru rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  'mysore': 'ಮೈಸೂರು',
  'mysuru': 'ಮೈಸೂರು',
  'hubli': 'ಹುಬ್ಬಳ್ಳಿ',
  'hubballi': 'ಹುಬ್ಬಳ್ಳಿ',
  'dharwad': 'ಧಾರವಾಡ',
  'mangaluru': 'ಮಂಗಳೂರು',
  'mangalore': 'ಮಂಗಳೂರು',
  'dakshina kannada': 'ಮಂಗಳೂರು',
  'belagavi': 'ಬೆಳಗಾವಿ',
  'belgaum': 'ಬೆಳಗಾವಿ',
  'kalaburagi': 'ಕಲಬುರಗಿ',
  'gulbarga': 'ಕಲಬುರಗಿ',
  'bagalkote': 'ಬಾಗಲಕೋಟೆ',
  'bagalkot': 'ಬಾಗಲಕೋಟೆ',
  'ballari': 'ಬಳ್ಳಾರಿ',
  'bellary': 'ಬಳ್ಳಾರಿ',
  'bidar': 'ಬೀದರ್',
  'chamarajanagar': 'ಚಾಮರಾಜನಗರ',
  'chamarajnagar': 'ಚಾಮರಾಜನಗರ',
  'chikkaballapur': 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ',
  'chicballapur': 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ',
  'chikkamagaluru': 'ಚಿಕ್ಕಮಗಳೂರು',
  'chikmagalur': 'ಚಿಕ್ಕಮಗಳೂರು',
  'chitradurga': 'ಚಿತ್ರದುರ್ಗ',
  'davanagere': 'ದಾವಣಗೆರೆ',
  'gadag': 'ಗದಗ',
  'hassana': 'ಹಾಸನ',
  'hassan': 'ಹಾಸನ',
  'haveri': 'ಹಾವೇರಿ',
  'kodagu': 'ಕೊಡಗು',
  'coorg': 'ಕೊಡಗು',
  'kolar': 'ಕೋಲಾರ',
  'koppal': 'ಕೊಪ್ಪಳ',
  'mandya': 'ಮಂಡ್ಯ',
  'raichur': 'ರಾಯಚೂರು',
  'ramanagara': 'ರಾಮನಗರ',
  'ramanagar': 'ರಾಮನಗರ',
  'shivamogga': 'ಶಿವಮೊಗ್ಗ',
  'shimoga': 'ಶಿವಮೊಗ್ಗ',
  'tumakuru': 'ತುಮಕೂರು',
  'tumkur': 'ತುಮಕೂರು',
  'udupi': 'ಉಡುಪಿ',
  'uttara kannada': 'ಉತ್ತರ ಕನ್ನಡ',
  'vijayanagara': 'ವಿಜಯನಗರ',
  'vijayapura': 'ವಿಜಯಪುರ',
  'bijapur': 'ವಿಜಯಪುರ',
  'yadgiri': 'ಯಾದಗಿರಿ',
  'yadgir': 'ಯಾದಗಿರಿ'
};

const matchCity = (cityName) => {
  if (!cityName) return null;
  const normalized = cityName.toLowerCase().trim();
  for (const [eng, kan] of Object.entries(DISTRICT_MAP)) {
    if (normalized.includes(eng)) {
      return kan;
    }
  }
  return null;
};

// All 31 Karnataka Districts list for option rendering
const KARNATAKA_DISTRICTS = [
  'ಬೆಂಗಳೂರು', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'ಮೈಸೂರು', 'ಮಂಗಳೂರು', 'ಹುಬ್ಬಳ್ಳಿ', 'ಧಾರವಾಡ', 'ಬೆಳಗಾವಿ',
  'ಕಲಬುರಗಿ', 'ಬಾಗಲಕೋಟೆ', 'ಬಳ್ಳಾರಿ', 'ಬೀದರ್', 'ಚಾಮರಾಜನಗರ', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'ಚಿಕ್ಕಮಗಳೂರು',
  'ಚಿತ್ರದುರ್ಗ', 'ದಾವಣಗೆರೆ', 'ಗದಗ', 'ಹಾಸನ', 'ಹಾವೇರಿ', 'ಕೊಡಗು', 'ಕೋಲಾರ', 'ಕೊಪ್ಪಳ', 'ಮಂಡ್ಯ',
  'ರಾಯಚೂರು', 'ರಾಮನಗರ', 'ಶಿವಮೊಗ್ಗ', 'ತುಮಕೂರು', 'ಉಡುಪಿ', 'ಉತ್ತರ ಕನ್ನಡ', 'ವಿಜಯನಗರ',
  'ವಿಜಯಪುರ', 'ಯಾದಗಿರಿ'
];

function LocalNewsTicker({ articles = [], onCategorySelect, activeCity, onCityChange }) {
  const [isDetecting, setIsDetecting] = useState(false);

  // Detect location on mount if not cached
  useEffect(() => {
    const cachedCity = localStorage.getItem('user_local_city');
    if (cachedCity) {
      onCityChange(cachedCity);
      return;
    }

    const fallbackIpGeolocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const city = data.city || '';
        const matched = matchCity(city);
        if (matched) {
          onCityChange(matched);
          localStorage.setItem('user_local_city', matched);
        }
      } catch (err) {
        console.warn('IP Geolocation fallback failed:', err.message);
      } finally {
        setIsDetecting(false);
      }
    };

    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county || '';
            const matched = matchCity(city);
            if (matched) {
              onCityChange(matched);
              localStorage.setItem('user_local_city', matched);
            } else {
              await fallbackIpGeolocation();
            }
          } catch (err) {
            await fallbackIpGeolocation();
          } finally {
            setIsDetecting(false);
          }
        },
        async () => {
          await fallbackIpGeolocation();
        },
        { timeout: 6000 }
      );
    } else {
      fallbackIpGeolocation();
    }
  }, []);

  const handleCityChange = (newCity) => {
    onCityChange(newCity);
    localStorage.setItem('user_local_city', newCity);
  };

  // Filter local articles. Fallback to state level news ('ರಾಜ್ಯ') if this city has no seeded headlines.
  const getLocalArticles = () => {
    let localList = articles.filter(a => a.category === activeCity);
    if (localList.length === 0) {
      // Fallback matching
      localList = articles.filter(a => ['ರಾಜ್ಯ', 'ಬೆಂಗಳೂರು', 'ಮೈಸೂರು', 'ಹುಬ್ಬಳ್ಳಿ'].includes(a.category));
    }
    return localList;
  };

  const localHeadlines = getLocalArticles();

  return (
    <div className="local-ticker">
      <div className="container">
        <div className="local-badge-wrap" style={{ marginRight: '8px' }}>
          <span className="local-indicator-dot"></span>
          <span className="local-badge-label">
            {activeCity} {isDetecting ? 'ಸುದ್ದಿ (ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...)' : 'ಸುದ್ದಿ'}:
          </span>
        </div>

        <div className="local-track">
          <div className="local-tape">
            {localHeadlines.length > 0 ? (
              localHeadlines.map((art, idx) => (
                <span 
                  key={`${art.id}-${idx}`} 
                  className="local-tape-item"
                  onClick={() => onCategorySelect(art.category)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="local-tape-category">[{art.category}]</span> {art.title}
                </span>
              ))
            ) : (
              <span className="local-tape-item">ಈ ಭಾಗದ ಸುದ್ದಿಗಳು ಸದ್ಯದಲ್ಲೇ ಪ್ರಕಟವಾಗಲಿವೆ.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalNewsTicker;
