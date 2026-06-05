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
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleCityChange = (newCity) => {
    onCityChange(newCity);
    onCategorySelect(newCity);
  };

  const currentDropdownValue = KARNATAKA_DISTRICTS.includes(selectedCategory)
    ? selectedCategory
    : activeCity;

  const closeDrawer = () => setDrawerOpen(false);

  const handleCategoryClick = (cat) => {
    onCategorySelect(cat);
    closeDrawer();
  };

  return (
    <>
      {/* ── BACKDROP ── */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── LEFT SLIDE DRAWER ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '280px', zIndex: 1000,
        background: '#111',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 30px rgba(0,0,0,0.6)',
      }}>
        {/* Drawer Header */}
        <div style={{
          background: 'var(--gold)', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 800, fontSize: '15px', color: '#111', fontFamily: 'var(--kn-font)' }}>
            ಸಮಾಚಾರ ಸಂಗ್ರಹ
          </span>
          <button onClick={closeDrawer} style={{
            background: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer',
            fontSize: '18px', color: '#111', lineHeight: 1,
            padding: '4px 8px', borderRadius: '4px', fontWeight: 700,
          }}>✕</button>
        </div>

        {/* Search inside drawer */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <input
            type="text"
            placeholder="🔍 ಹುಡುಕಿ..."
            value={searchQuery}
            autoFocus={drawerOpen}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.07)',
              color: '#fff', fontSize: '13px',
              fontFamily: 'var(--kn-font)', outline: 'none',
            }}
          />
        </div>

        {/* Nav Category Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div style={{
            padding: '10px 20px 6px',
            fontSize: '10px', color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
          }}>
            ವಿಭಾಗಗಳು
          </div>
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                padding: '13px 20px',
                cursor: 'pointer',
                fontFamily: 'var(--kn-font)',
                fontSize: '14px',
                fontWeight: selectedCategory === cat ? 800 : 600,
                color: selectedCategory === cat ? 'var(--gold)' : '#ccc',
                background: selectedCategory === cat ? 'rgba(255,195,20,0.08)' : 'transparent',
                borderLeft: selectedCategory === cat ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (selectedCategory !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                if (selectedCategory !== cat) e.currentTarget.style.background = 'transparent';
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* ── STICKY NAVBAR ── */}
      <nav className="nav">
        <div className="container">
          {/* 🔍 Search / Drawer toggle — first */}
          <div className="nav-search-wrap" style={{
            marginLeft: 0, marginRight: '4px',
            paddingRight: '8px',
            borderRight: '1.5px solid rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <button
              className="nav-search-icon-btn"
              onClick={() => setDrawerOpen(o => !o)}
              aria-label="ಮೆನು / ಹುಡುಕು"
              title="ಹುಡುಕು ಮತ್ತು ಮೆನು"
            >
              🔍
            </button>
          </div>

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
        </div>
      </nav>
    </>
  );
}

export default NavBar;
