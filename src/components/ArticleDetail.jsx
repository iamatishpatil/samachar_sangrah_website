import React, { useState, useEffect } from 'react';
import { Thumbnail } from './portal/NewsCard';

function ArticleDetail({ articleId, navigate }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/news/${articleId}`)
      .then(res => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(data => {
        setArticle(data);
        setLoading(false);
        // Fetch related articles from same category
        return fetch(`/api/news?category=${encodeURIComponent(data.category)}`);
      })
      .then(res => res.json())
      .then(related => {
        setRelatedArticles(related.filter(a => a.id !== parseInt(articleId)).slice(0, 4));
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [articleId]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('kn-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #f3f3f3',
          borderTop: '4px solid var(--accent)', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Noto Sans Kannada, sans-serif' }}>
          ಲೋಡ್ ಆಗುತ್ತಿದೆ...
        </p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>📰</div>
        <h2 style={{ color: 'var(--text-dark)' }}>ಸುದ್ದಿ ಸಿಗಲಿಲ್ಲ</h2>
        <p style={{ color: 'var(--text-muted)' }}>The article you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px 24px', cursor: 'pointer',
            fontWeight: 700, fontSize: '14px'
          }}
        >
          ← ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      {/* Back Button Bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '12px 0', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1) || navigate('/')}
            style={{
              background: 'transparent', border: '1.5px solid var(--border)',
              borderRadius: '8px', padding: '7px 16px', cursor: 'pointer',
              fontWeight: 600, color: 'var(--text-dark)', display: 'flex',
              alignItems: 'center', gap: '6px', fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            ← ಹಿಂದೆ ಹೋಗಿ
          </button>
          <span style={{
            background: 'var(--accent)', color: '#fff', padding: '4px 12px',
            borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            fontFamily: 'Noto Sans Kannada, sans-serif'
          }}>
            {article.category}
          </span>
        </div>
      </div>

      {/* Main Article Content */}
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '32px',
          alignItems: 'flex-start'
        }}>

          {/* Left: Full Article */}
          <article style={{
            background: '#fff', borderRadius: '16px',
            overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
          }}>

            {/* Hero Image */}
            <Thumbnail
              imageUrl={article.image_url}
              category={article.category}
              heightClass="420px"
              width="100%"
            />

            {/* Article Body */}
            <div style={{ padding: '32px 36px 40px' }}>
              {/* Category + Date */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '16px',
                flexWrap: 'wrap', gap: '8px'
              }}>
                <span style={{
                  background: 'var(--accent)', color: '#fff', padding: '4px 14px',
                  borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  fontFamily: 'Noto Sans Kannada, sans-serif'
                }}>
                  {article.category}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  🕐 {formatDate(article.created_at)}
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 900,
                lineHeight: 1.4,
                color: 'var(--text-dark)',
                marginBottom: '16px',
                fontFamily: 'Noto Sans Kannada, sans-serif'
              }}>
                {article.title}
              </h1>

              {/* Author */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: '#f7f8fa',
                borderRadius: '10px', marginBottom: '28px',
                borderLeft: '4px solid var(--accent)'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '16px'
                }}>
                  ✍
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)' }}>
                    {article.author}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ವರದಿಗಾರ</div>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '2px solid #f0f0f0', marginBottom: '28px' }} />

              {/* Article Content */}
              <div style={{
                fontSize: '18px',
                lineHeight: '1.9',
                color: '#2d3748',
                fontFamily: 'Noto Sans Kannada, sans-serif',
                whiteSpace: 'pre-wrap'
              }}>
                {article.content}
              </div>

              {/* Share Footer */}
              <div style={{
                marginTop: '40px', paddingTop: '24px',
                borderTop: '2px solid #f0f0f0',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  ಈ ಸುದ್ದಿ ಉಪಯೋಗಿ ಎಂದನಿಸಿದರೆ ಶೇರ್ ಮಾಡಿ
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { label: 'WhatsApp', bg: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}` },
                    { label: 'Twitter/X', bg: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}` },
                    { label: 'Facebook', bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` }
                  ].map(btn => (
                    <a
                      key={btn.label}
                      href={btn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: btn.bg, color: '#fff', textDecoration: 'none',
                        padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: 700, transition: 'opacity 0.2s'
                      }}
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Right: Related Articles */}
          <aside>
            <div style={{
              background: '#fff', borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)', position: 'sticky', top: '70px'
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '2px solid #f0f0f0',
                fontWeight: 800, fontSize: '15px', color: 'var(--text-dark)',
                fontFamily: 'Noto Sans Kannada, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{
                  width: '4px', height: '20px', background: 'var(--accent)',
                  borderRadius: '2px', display: 'inline-block'
                }} />
                ಇದೇ ವಿಷಯದ ಸುದ್ದಿಗಳು
              </div>

              {relatedArticles.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>
                  ಇನ್ನು ಸಂಬಂಧಿತ ಸುದ್ದಿ ಇಲ್ಲ
                </div>
              ) : (
                relatedArticles.map((related, i) => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/article/${related.id}`)}
                    style={{
                      display: 'flex', gap: '12px', padding: '14px 20px',
                      borderBottom: i < relatedArticles.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f7f8fa'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Thumbnail
                      imageUrl={related.image_url}
                      category={related.category}
                      heightClass="68px"
                      width="88px"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 700,
                        lineHeight: 1.4, color: 'var(--text-dark)',
                        fontFamily: 'Noto Sans Kannada, sans-serif',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                      }}>
                        {related.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        🕐 {new Date(related.created_at).toLocaleDateString('kn-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          article + aside { display: none; }
        }
      `}</style>
    </div>
  );
}

export default ArticleDetail;
