import React from 'react';

function Masthead({ onHomeClick }) {
  return (
    <header className="masthead">
      <div className="container">
        <div className="logo-block" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <img
            src="/IMG_1105.PNG"
            alt="ಸಮಾಚಾರ ಸಂಗ್ರಹ Logo"
            className="masthead-logo-img"
            style={{ height: '80px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>
    </header>
  );
}

export default Masthead;
