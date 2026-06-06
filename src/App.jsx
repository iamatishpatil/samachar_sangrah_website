import React, { useState, useEffect } from 'react';
import NewsPortal from './components/NewsPortal';
import AdminDashboard from './components/AdminDashboard';
import ArticleDetail from './components/ArticleDetail';

// Mapping of internal Kannada category and district names to clean URL slug paths
const ROUTE_MAP = {
  // Main Categories
  'ರಾಜ್ಯ': 'state',
  'ರಾಷ್ಟ್ರ': 'nation',
  'ಅಂತರರಾಷ್ಟ್ರೀಯ': 'international',
  'ರಾಜಕೀಯ': 'politics',
  'ವ್ಯಾಪಾರ': 'business',
  'ಕ್ರೀಡೆ': 'sports',
  'ಮನರಂಜನೆ': 'entertainment',
  'ತಂತ್ರಜ್ಞಾನ': 'technology',
  'ಆರೋಗ್ಯ': 'health',
  'ಧರ್ಮ': 'religion',
  'ಪ್ರಚಲಿತ ವಿದ್ಯಮಾನಗಳು': 'current-affairs',
  'ಟ್ರೆಂಡಿಂಗ್': 'trending',
  'ಫೋಟೋ ಗ್ಯಾಲರಿ': 'photo-gallery',

  // Karnataka Districts
  'ಬೆಂಗಳೂರು': 'bengaluru',
  'ಮೈಸೂರು': 'mysuru',
  'ಮಂಗಳೂರು': 'mangaluru',
  'ಕೊಡಗು': 'kodagu',
  'ಚಿಕ್ಕಮಗಳೂರು': 'chikkamagaluru',
  'ಶಿವಮೊಗ್ಗ': 'shivamogga',
  'ಉಡುಪಿ': 'udupi',
  'ಉತ್ತರ ಕನ್ನಡ': 'uttara-kannada',
  'ದಕ್ಷಿಣ ಕನ್ನಡ': 'dakshina-kannada',
  'ಹಾಸನ': 'hasana',
  'ಮಂಡ್ಯ': 'mandya',
  'ಚามರಾಜನಗರ': 'chamarajanagara',
  'ಕೋಲಾರ': 'kolara',
  'ಚಿಕ್ಕಬಳ್ಳಾಪುರ': 'chikkaballapura',
  'ತುಮಕೂರು': 'tumakuru',
  'ಚಿತ್ರದುರ್ಗ': 'chitradurga',
  'ದಾವಣಗೆರೆ': 'davanagere',
  'ಬೆಳಗಾವಿ': 'belagavi',
  'ವಿಜಯಪುರ': 'vijayapura',
  'ಬಾಗಲಕೋಟೆ': 'bagalakote',
  'ಧಾರವಾಡ': 'dharwada',
  'ಗದಗ': 'gadaga',
  'ಹಾವೇರಿ': 'haveri',
  'ಕೊಪ್ಪಳ': 'koppala',
  'ರಾಯಚೂರು': 'rayachuru',
  'ಬಳ್ಳಾರಿ': 'ballari',
  'ವಿಜಯನಗರ': 'vijayanagara',
  'ಕಲಬುರಗಿ': 'kalaburagi',
  'ಬೀದರ್': 'bidara',
  'ಯಾದಗಿರಿ': 'yadigiri',
  'ರಾಮನಗರ': 'ramanagara'
};

const REVERSE_ROUTE_MAP = {};
Object.entries(ROUTE_MAP).forEach(([kannada, english]) => {
  REVERSE_ROUTE_MAP[english] = kannada;
});

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen to browser back/forward buttons
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (pathOrDelta) => {
    if (pathOrDelta === -1) {
      window.history.back();
      return;
    }
    window.history.pushState({}, '', pathOrDelta);
    setCurrentPath(pathOrDelta);
  };

  if (currentPath.startsWith('/admin')) {
    return <AdminDashboard navigate={navigate} />;
  }

  // Article detail page: /article/:id or /news/:id
  const articleMatch = currentPath.match(/^\/(?:article|news)\/(\d+)$/);
  if (articleMatch) {
    return <ArticleDetail articleId={articleMatch[1]} navigate={navigate} />;
  }

  // Parse category/district based on clean URL path
  const slug = currentPath.replace(/^\//, '').toLowerCase();
  const parsedCategory = REVERSE_ROUTE_MAP[slug] || 'ಮುಖಪುಟ';

  return (
    <NewsPortal 
      navigate={navigate} 
      currentCategory={parsedCategory} 
      routeMap={ROUTE_MAP}
    />
  );
}

export default App;
