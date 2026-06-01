import React from 'react';

function Masthead({ onHomeClick }) {
  return (
    <header className="masthead">
      <div className="container">
        <div className="logo-block" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <h1 className="logo-kn">
            ಸಮಾಚಾರ<br />
            ಸಂಗ್ರಹ
          </h1>
          <div className="logo-en">Samachar Sangrah</div>
          <div className="logo-tagline">ನಿಜವಾದ ಸುದ್ದಿ · ಸದಾ ವಿಶ್ವಾಸಾರ್ಹ</div>
        </div>
        <div className="masthead-ad">[ ಜಾಹೀರಾತು ಸ್ಥಳ — 728×90 ]</div>
      </div>
    </header>
  );
}

export default Masthead;
