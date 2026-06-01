import React from 'react';

function Ticker({ tickerItems }) {
  if (!tickerItems || tickerItems.length === 0) return null;

  return (
    <div className="ticker">
      <div className="container">
        <div className="ticker-label">🔴 ತಾಜಾ ಸುದ್ದಿ</div>
        <div className="ticker-track">
          <div className="ticker-tape">
            {tickerItems.map(item => (
              <span key={item.id} className="ticker-item">{item.message}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticker;
