import React from 'react';

// Shared thumbnail rendering engine with customizable width and height
export const Thumbnail = ({ imageUrl, category, heightClass, width = "100%", objectFit = "cover", aspectRatio }) => {
  const style = { height: heightClass || 'auto', width: width, objectFit, aspectRatio, backgroundColor: '#f8f9fa' };

  if (imageUrl && !imageUrl.startsWith('ph ph-')) {
    return (
      <img 
        src={imageUrl} 
        alt="Thumbnail" 
        className="thumb" 
        style={style} 
      />
    );
  }
  
  return (
    <div 
      className={`thumb ph ${imageUrl || 'ph-red'}`} 
      style={style}
    >
      {category || '📸'}
    </div>
  );
};

function NewsCard({ article, type = "side", heightClass, onClick }) {
  if (!article) return null;

  const timeString = new Date(article.created_at).toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' });
  const dateString = new Date(article.created_at).toLocaleDateString('kn-IN');

  if (type === 'hero') {
    return (
      <div className="hero-card" onClick={onClick} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
        <Thumbnail imageUrl={article.image_url} category={article.category} heightClass={null} width="100%" aspectRatio="16/9" />
        <div className="hero-body" style={{ padding: '15px 0' }}>
          <div className="badge-cat" style={{ marginBottom: '10px' }}>{article.category}</div>
          <div className="hero-title" style={{ color: '#111' }}>{article.title}</div>
          <div className="hero-meta" style={{ color: '#555' }}>
            🕐 {timeString} · ✍ {article.author}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    const hasImage = heightClass !== '0px';
    return (
      <div className="list-card" onClick={onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        {hasImage && (
          <Thumbnail 
            imageUrl={article.image_url} 
            category={article.category} 
            heightClass={null} 
            width="88px"
            aspectRatio="4/3"
          />
        )}
        <div style={{ marginLeft: hasImage ? '11px' : '0px', flex: 1, minWidth: 0 }}>
          <div className="list-title">{article.title}</div>
          <div className="list-meta">
            🕐 {dateString}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'detailed') {
    return (
      <div className="side-card" style={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
        <Thumbnail imageUrl={article.image_url} category={article.category} heightClass={null} width="100%" aspectRatio="16/9" />
        <div className="side-card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 180px)' }}>
          <div>
            <span className="card-cat">{article.category}</span>
            <div className="card-title" style={{ fontSize: '15px', fontWeight: 800 }}>{article.title}</div>
            <p style={{ fontSize: '13px', color: '#555', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              {article.content}
            </p>
          </div>
          <div className="card-meta" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>✍ {article.author}</span>
            <span>🕐 {dateString}</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Standard "side" card type
  return (
    <div className="side-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Thumbnail imageUrl={article.image_url} category={article.category} heightClass={null} width="100%" aspectRatio="16/9" />
      <div className="side-card-body">
        <span className="card-cat">{article.category}</span>
        <div className="card-title">{article.title}</div>
        <div className="card-meta">
          🕐 {dateString}
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
