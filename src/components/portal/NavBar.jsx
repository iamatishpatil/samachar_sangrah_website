import React from 'react';

const KARNATAKA_DISTRICTS = [
  'ಬೆಂಗಳೂರು', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'ಮೈಸೂರು', 'ಮಂಗಳೂರು', 'ಹುಬ್ಬಳ್ಳಿ', 'ಧಾರವಾಡ', 'ಬೆಳಗಾವಿ',
  'ಕಲಬುರಗಿ', 'ಬಾಗಲಕೋಟೆ', 'ಬಳ್ಳಾರಿ', 'ಬೀದರ್', 'ಚಾಮರಾಜನಗರ', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'ಚಿಕ್ಕಮಗಳೂರು',
  'ಚಿತ್ರದುರ್ಗ', 'ದಾವಣಗೆರೆ', 'ಗದಗ', 'ಹಾಸನ', 'ಹಾವೇರಿ', 'ಕೊಡಗು', 'ಕೋಲಾರ', 'ಕೊಪ್ಪಳ', 'ಮಂಡ್ಯ',
  'ರಾಯಚೂರು', 'ರಾಮನಗರ', 'ಶಿವಮೊಗ್ಗ', 'ತುಮಕೂರು', 'ಉಡುಪಿ', 'ಉತ್ತರ ಕನ್ನಡ', 'ವಿಜಯನಗರ',
  'ವಿಜಯಪುರ', 'ಯಾದಗಿರಿ'
];

function NavBar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  searchQuery, 
  setSearchQuery,
  activeCity,
  onCityChange
}) {
  const handleCityChange = (newCity) => {
    onCityChange(newCity);
    onCategorySelect(newCity);
  };

  // Sync dropdown visual state with current district category if active
  const currentDropdownValue = KARNATAKA_DISTRICTS.includes(selectedCategory)
    ? selectedCategory
    : activeCity;

  return (
    <nav className="nav">
      <div className="container">
        {categories.map(cat => {
          const isHome = cat === 'ಮುಖಪುಟ';
          return (
            <React.Fragment key={cat}>
              <a 
                className={`nav-link ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => onCategorySelect(cat)}
                style={{ cursor: 'pointer' }}
              >
                {cat}
              </a>
              {isHome && (
                <div className="nav-district-selector">
                  <span className="nav-district-label">ನಿಮ್ಮ ಜಿಲ್ಲೆ:</span>
                  <select 
                    value={currentDropdownValue} 
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="nav-district-select"
                    aria-label="ಸ್ಥಳ ಆಯ್ಕೆ ಮಾಡಿ"
                  >
                    {KARNATAKA_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div className="nav-search-wrap">
          <input 
            className="nav-search" 
            type="text" 
            placeholder="🔍 ಹುಡುಕಿ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ಹುಡುಕು ಪಠ್ಯ"
          />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
