import React, { useState, useEffect } from 'react';
import TopBar from './portal/TopBar';
import Masthead from './portal/Masthead';
import NavBar from './portal/NavBar';
import Ticker from './portal/Ticker';
import NewsCard, { Thumbnail } from './portal/NewsCard';
import Sidebar from './portal/Sidebar';
import Footer from './portal/Footer';

function NewsPortal({ navigate, currentCategory, articleId, routeMap }) {
  const [articles, setArticles] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [poll, setPoll] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState('ಬೆಂಗಳೂರು');
  
  // Interactive Poll States
  const [selectedPollOption, setSelectedPollOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [pollResults, setPollResults] = useState(null);

  // Newsletter States
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState({ text: '', type: '' });

  // Fetch initial data
  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching articles:', err));

    fetch('/api/ticker')
      .then(res => res.json())
      .then(data => setTickerItems(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching ticker:', err));

    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching videos:', err));

    fetch('/api/opinions')
      .then(res => res.json())
      .then(data => setOpinions(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching opinions:', err));

    fetch('/api/poll')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.options) {
          setPoll(data);
          const voted = localStorage.getItem(`voted_poll_${data.id}`);
          if (voted) {
            setHasVoted(true);
            setPollResults(JSON.parse(voted));
          }
        } else {
          setPoll(null);
        }
      })
      .catch(err => {
        console.error('Error fetching poll:', err);
        setPoll(null);
      });
  }, []);

  // Category navigation list
  const categories = [
    'ಮುಖಪುಟ', 'ರಾಜ್ಯ', 'ರಾಷ್ಟ್ರ', 'ಅಂತರರಾಷ್ಟ್ರೀಯ', 'ರಾಜಕೀಯ',
    'ಕ್ರೀಡೆ', 'ಮನರಂಜನೆ', 'ತಂತ್ರಜ್ಞಾನ', 'ಆರೋಗ್ಯ', 'ಅಭಿಪ್ರಾಯ'
  ];

  // Filter articles based on selected category and search queries
  const getFilteredArticles = () => {
    let list = [...articles];
    
    // Category filter (if not Home)
    if (selectedCategory !== 'ಮುಖಪುಟ') {
      if (selectedCategory === 'ರಾಜ್ಯ') {
        list = list.filter(a => ['ರಾಜ್ಯ', 'ಬೆಂಗಳೂರು', 'ಮೈಸೂರು', 'ಹುಬ್ಬಳ್ಳಿ'].includes(a.category));
      } else {
        list = list.filter(a => a.category === selectedCategory);
      }
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredArticles = getFilteredArticles();

  // Poll Vote submission
  const handleVote = () => {
    if (!poll || !selectedPollOption || hasVoted) return;

    fetch('/api/poll/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: poll.id, option: selectedPollOption })
    })
      .then(res => res.json())
      .then(updatedPoll => {
        setHasVoted(true);
        setPollResults(updatedPoll.votes);
        localStorage.setItem(`voted_poll_${poll.id}`, JSON.stringify(updatedPoll.votes));
      })
      .catch(err => console.error('Error submitting vote:', err));
  };

  // Newsletter form submission
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      setNewsletterMsg({ text: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ ಇ-ಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.', type: 'error' });
      return;
    }

    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newsletterEmail })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setNewsletterMsg({ text: data.error, type: 'error' });
        } else {
          setNewsletterMsg({ text: '✅ ಯಶಸ್ವಿಯಾಗಿ ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ!', type: 'success' });
          setNewsletterEmail('');
        }
      })
      .catch(() => {
        setNewsletterMsg({ text: 'ಸಂಪರ್ಕ ದೋಷ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.', type: 'error' });
      });
  };

  // Split calculations for home page grids
  const heroNews = filteredArticles[0];
  const sideNews = filteredArticles.slice(1, 3);
  
  // Specific category filters for dashboard widgets
  const stateNews = articles.filter(a => ['ಬೆಂಗಳೂರು', 'ಮೈಸೂರು', 'ಹುಬ್ಬಳ್ಳಿ', 'ರಾಜ್ಯ'].includes(a.category));
  const nationalNews = articles.filter(a => a.category === 'ರಾಷ್ಟ್ರ');
  const politicsNews = articles.filter(a => a.category === 'ರಾಜಕೀಯ');
  const sportsNews = articles.filter(a => ['ಕ್ರೀಡೆ', 'IPL 2025'].includes(a.category));
  const entNews = articles.filter(a => a.category === 'ಮನರಂಜನೆ');
  const techNews = articles.filter(a => a.category === 'ತಂತ್ರಜ್ಞಾನ');
  const healthNews = articles.filter(a => a.category === 'ಆರೋಗ್ಯ');

  const selectedArticle = articleId ? articles.find(a => String(a.id) === String(articleId)) : null;

  const handleArticleClick = (id) => {
    setSearchQuery('');
    navigate(`/news/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category navigation redirects
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    
    const slug = routeMap[category];
    const targetPath = slug ? `/${slug}` : '/';
    navigate(targetPath);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <TopBar navigate={navigate} />
      
      <Masthead onHomeClick={() => handleCategorySelect('ಮುಖಪುಟ')} />

      <NavBar 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCity={activeCity}
        onCityChange={setActiveCity}
      />



      <Ticker tickerItems={tickerItems} />

      <div className="main-wrap">
        <main>
          {articleId && !selectedArticle ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)', background: '#fff', border: '1px solid var(--border)', borderRadius: '5px' }}>
              <h3>ಸುದ್ದಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ ಅಥವಾ ಲಭ್ಯವಿಲ್ಲ...</h3>
              <button className="back-btn" onClick={() => handleCategorySelect('ಮುಖಪುಟ')} style={{ marginTop: '16px' }}>
                ← ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ
              </button>
            </div>
          ) : selectedArticle ? (
            /* ━━━━━━━━━━━━━━━━━━ ARTICLE DETAIL PAGE ━━━━━━━━━━━━━━━━━━ */
            <div className="article-detail-wrap">
              <button className="back-btn" onClick={() => handleCategorySelect(selectedArticle.category || 'ಮುಖಪುಟ')}>
                ← {selectedArticle.category || 'ಮುಖಪುಟ'} ವರ್ಗಕ್ಕೆ ಹಿಂತಿರುಗಿ
              </button>
              
              <div>
                <span 
                  className="badge-cat" 
                  style={{ cursor: 'pointer', marginBottom: '10px', display: 'inline-block' }}
                  onClick={() => handleCategorySelect(selectedArticle.category)}
                >
                  {selectedArticle.category}
                </span>
              </div>
              
              <h1>{selectedArticle.title}</h1>
              
              <div className="article-meta">
                ✍ {selectedArticle.author} · 🕐 {new Date(selectedArticle.created_at).toLocaleDateString('kn-IN')} · {new Date(selectedArticle.created_at).toLocaleTimeString('kn-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="article-image-wrap">
                <Thumbnail imageUrl={selectedArticle.image_url} category={selectedArticle.category} heightClass="400px" width="100%" />
              </div>
              
              <div className="article-body-content">
                {selectedArticle.content.split('\n').filter(p => p.trim() !== '').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Related news section */}
              {articles.filter(a => a.category === selectedArticle.category && String(a.id) !== String(selectedArticle.id)).length > 0 && (
                <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  <div className="sec-head" style={{ marginBottom: '16px' }}>
                    <h2>ಮತ್ತಷ್ಟು ಸಂಬಂಧಿತ ಸುದ್ದಿಗಳು</h2>
                    <div className="sec-line"></div>
                  </div>
                  <div className="cat-3grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {articles
                      .filter(a => a.category === selectedArticle.category && String(a.id) !== String(selectedArticle.id))
                      .slice(0, 3)
                      .map(art => (
                        <NewsCard key={art.id} article={art} type="detailed" heightClass="180px" onClick={() => handleArticleClick(art.id)} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedCategory === 'ಮುಖಪುಟ' && searchQuery === '' ? (
            /* ━━━━━━━━━━━━━━━━━━ DEFAULT HOME PAGE GRID ━━━━━━━━━━━━━━━━━━ */
            <>
              {/* HERO */}
              <div className="sec-head">
                <h2>ಪ್ರಮುಖ ಸುದ್ದಿಗಳು</h2>
                <div className="sec-line"></div>
                <a onClick={() => handleCategorySelect('ರಾಜ್ಯ')} className="sec-more" style={{ cursor: 'pointer' }}>
                  ಎಲ್ಲಾ ನೋಡಿ →
                </a>
              </div>
              
              {articles.length > 0 && (
                <div className="hero-grid">
                  {heroNews && (
                    <NewsCard article={heroNews} type="hero" heightClass="400px" onClick={() => handleArticleClick(heroNews.id)} />
                  )}

                  {sideNews.map((art) => (
                    <NewsCard key={art.id} article={art} type="side" heightClass="140px" onClick={() => handleArticleClick(art.id)} />
                  ))}
                </div>
              )}

              {/* STATE NEWS */}
              <div className="cat-section">
                <div className="sec-head">
                  <h2>ರಾಜ್ಯ ಸುದ್ದಿ</h2>
                  <div className="sec-line"></div>
                  <a onClick={() => handleCategorySelect('ರಾಜ್ಯ')} className="sec-more" style={{ cursor: 'pointer' }}>
                    ಇನ್ನಷ್ಟು →
                  </a>
                </div>
                <div className="cat-3grid">
                  {stateNews.slice(0, 3).map(art => (
                    <NewsCard key={art.id} article={art} type="side" heightClass="130px" onClick={() => handleArticleClick(art.id)} />
                  ))}
                </div>
                {stateNews.length > 3 && (
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '12px 16px', marginTop: '14px' }}>
                    {stateNews.slice(3, 6).map(art => (
                      <NewsCard key={art.id} article={art} type="list" heightClass="66px" onClick={() => handleArticleClick(art.id)} />
                    ))}
                  </div>
                )}
              </div>

              {/* NATIONAL + POLITICS */}
              <div className="cat-2grid" style={{ marginBottom: '28px' }}>
                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ರಾಷ್ಟ್ರೀಯ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ರಾಷ್ಟ್ರ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  {nationalNews[0] && (
                    <div style={{ marginBottom: '12px' }}>
                      <NewsCard article={nationalNews[0]} type="side" heightClass="150px" onClick={() => handleArticleClick(nationalNews[0].id)} />
                    </div>
                  )}
                  {nationalNews.length > 1 && (
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                      {nationalNews.slice(1, 4).map(art => (
                        <div key={art.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                          <NewsCard article={art} type="list" heightClass="0px" onClick={() => handleArticleClick(art.id)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ರಾಜಕೀಯ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ರಾಜಕೀಯ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                    <ul className="num-list">
                      {politicsNews.slice(0, 5).map((art, idx) => (
                        <li key={art.id} className="num-item" onClick={() => handleArticleClick(art.id)} style={{ cursor: 'pointer' }}>
                          <div className="num-badge">{idx + 1}</div>
                          <div>
                            <div className="num-title">{art.title}</div>
                            <div className="list-meta">🕐 {new Date(art.created_at).toLocaleDateString('kn-IN')}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SPORTS + ENTERTAINMENT */}
              <div className="cat-2grid" style={{ marginBottom: '28px' }}>
                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ಕ್ರೀಡೆ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ಕ್ರೀಡೆ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  {sportsNews[0] && (
                    <div style={{ marginBottom: '12px' }}>
                      <NewsCard article={sportsNews[0]} type="side" heightClass="140px" onClick={() => handleArticleClick(sportsNews[0].id)} />
                    </div>
                  )}
                  {sportsNews.length > 1 && (
                    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                      {sportsNews.slice(1, 3).map(art => (
                        <NewsCard key={art.id} article={art} type="list" heightClass="66px" onClick={() => handleArticleClick(art.id)} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ಮನರಂಜನೆ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ಮನರಂಜನೆ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                    {entNews.slice(0, 3).map(art => (
                      <NewsCard key={art.id} article={art} type="list" heightClass="66px" onClick={() => handleArticleClick(art.id)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* VIDEO SECTION */}
              {videos.length > 0 && (
                <div className="video-section">
                  <div className="sec-head">
                    <h2>📹 ವಿಡಿಯೋ</h2>
                    <div className="sec-line"></div>
                    <a href="#" className="sec-more">ಎಲ್ಲಾ ವಿಡಿಯೋ →</a>
                  </div>
                  <div className="video-grid">
                    {videos.slice(0, 4).map(v => (
                      <div key={v.id} className="video-card">
                        <div className="video-thumb">
                          <Thumbnail imageUrl={v.image_url} category="📹" heightClass="110px" />
                          <div className="play-ring"></div>
                          <div className="video-dur">{v.duration}</div>
                        </div>
                        <div className="video-title">{v.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPINIONS */}
              {opinions.length > 0 && (
                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ಅಭಿಪ್ರಾಯ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ಅಭಿಪ್ರಾಯ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  <div className="opinion-grid">
                    {opinions.slice(0, 3).map((op, idx) => (
                      <div 
                        key={op.id} 
                        className="opinion-card" 
                        style={{ borderTopColor: idx === 1 ? 'var(--gold)' : idx === 2 ? '#16a34a' : 'var(--red)' }}
                      >
                        <div className="author-row">
                          <div className="author-avatar">{op.author_avatar}</div>
                          <div>
                            <div className="author-name">{op.author_name}</div>
                            <div className="author-role">{op.author_role}</div>
                          </div>
                        </div>
                        <div className="opinion-headline">{op.headline}</div>
                        <div className="opinion-quote">{op.quote}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TECH + HEALTH */}
              <div className="cat-2grid" style={{ marginBottom: '28px' }}>
                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ತಂತ್ರಜ್ಞಾನ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ತಂತ್ರಜ್ಞಾನ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                    {techNews.slice(0, 3).map(art => (
                      <NewsCard key={art.id} article={art} type="list" heightClass="66px" onClick={() => handleArticleClick(art.id)} />
                    ))}
                  </div>
                </div>

                <div className="cat-section">
                  <div className="sec-head">
                    <h2>ಆರೋಗ್ಯ</h2>
                    <div className="sec-line"></div>
                    <a onClick={() => handleCategorySelect('ಆರೋಗ್ಯ')} className="sec-more" style={{ cursor: 'pointer' }}>
                      ಇನ್ನಷ್ಟು →
                    </a>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '5px', padding: '10px 14px' }}>
                    {healthNews.slice(0, 3).map(art => (
                      <NewsCard key={art.id} article={art} type="list" heightClass="66px" onClick={() => handleArticleClick(art.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ━━━━━━━━━━━━━━━━━━ CATEGORY FILTER / SEARCH RESULTS ━━━━━━━━━━━━━━━━━━ */
            <>
              <div className="sec-head">
                <h2>
                  {searchQuery !== '' 
                    ? `ಹುಡುಕಾಟದ ಫಲಿತಾಂಶಗಳು: "${searchQuery}"` 
                    : `${selectedCategory} ಸುದ್ದಿ`}
                </h2>
                <div className="sec-line"></div>
                <a onClick={() => handleCategorySelect('ಮುಖಪುಟ')} className="sec-more" style={{ cursor: 'pointer' }}>
                  ಮುಖಪುಟಕ್ಕೆ →
                </a>
              </div>

              {filteredArticles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)', background: '#fff', border: '1px solid var(--border)', borderRadius: '5px' }}>
                  <h3>ಯಾವುದೇ ಸುದ್ದಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.</h3>
                  <p style={{ marginTop: '8px' }}>ದಯವಿಟ್ಟು ಬೇರೆ ವರ್ಗ ಅಥವಾ ಹುಡುಕಾಟ ಪದಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.</p>
                </div>
              ) : (
                <div className="cat-3grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {filteredArticles.map(art => (
                    <NewsCard key={art.id} article={art} type="detailed" heightClass="180px" onClick={() => handleArticleClick(art.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <Sidebar 
          activeCity={activeCity}
          trendingArticles={articles.slice(0, 5)}
          onArticleClick={(art) => handleArticleClick(art.id)}
          poll={poll}
          selectedPollOption={selectedPollOption}
          setSelectedPollOption={setSelectedPollOption}
          hasVoted={hasVoted}
          onVote={handleVote}
          pollResults={pollResults}
          newsletterEmail={newsletterEmail}
          setNewsletterEmail={setNewsletterEmail}
          newsletterMsg={newsletterMsg}
          onNewsletterSubmit={handleNewsletterSubmit}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      <Footer onCategorySelect={handleCategorySelect} />
    </>
  );
}

export default NewsPortal;
