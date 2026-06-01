import React, { useState, useEffect } from 'react';

function AdminDashboard({ navigate }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('news');

  // Loaded database states
  const [articles, setArticles] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activePoll, setActivePoll] = useState(null);

  // Forms inputs states
  // News Form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('ರಾಜ್ಯ');
  const [newsAuthor, setNewsAuthor] = useState('');
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsImagePlaceholder, setNewsImagePlaceholder] = useState('ph ph-red');
  const [newsMsg, setNewsMsg] = useState({ text: '', type: '' });
  const [newsSearch, setNewsSearch] = useState('');

  // Ticker Form
  const [tickerText, setTickerText] = useState('');
  const [tickerMsg, setTickerMsg] = useState({ text: '', type: '' });

  // Video Form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('#');
  const [videoImagePlaceholder, setVideoImagePlaceholder] = useState('ph ph-red');
  const [videoMsg, setVideoMsg] = useState({ text: '', type: '' });

  // Opinion Form
  const [opinionAuthor, setOpinionAuthor] = useState('');
  const [opinionRole, setOpinionRole] = useState('');
  const [opinionAvatar, setOpinionAvatar] = useState('👨');
  const [opinionHeadline, setOpinionHeadline] = useState('');
  const [opinionQuote, setOpinionQuote] = useState('');
  const [opinionMsg, setOpinionMsg] = useState({ text: '', type: '' });

  // Poll Form
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');
  const [pollOption3, setPollOption3] = useState('');
  const [pollOption4, setPollOption4] = useState('');
  const [pollMsg, setPollMsg] = useState({ text: '', type: '' });

  // Verify token on mount/change
  useEffect(() => {
    if (token) {
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token verification failed');
          return res.json();
        })
        .then(data => {
          // Token is valid
          loadDashboardData();
        })
        .catch(() => {
          // Token expired or invalid, log out
          handleLogout();
        });
    }
  }, [token]);

  // Load backend database records
  const loadDashboardData = () => {
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch('/api/news')
      .then(res => res.json())
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/ticker')
      .then(res => res.json())
      .then(data => setTickerItems(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/opinions')
      .then(res => res.json())
      .then(data => setOpinions(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/poll')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.options) {
          setActivePoll(data);
        } else {
          setActivePoll(null);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/admin/subscribers', { headers })
      .then(res => res.json())
      .then(data => setSubscribers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!username || !password) {
      setAuthError('Please enter username and password');
      return;
    }

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid username or password');
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      })
      .catch(err => {
        setAuthError(err.message);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setUsername('');
    setPassword('');
  };

  // 📰 Add Article Submit
  const handleAddArticle = (e) => {
    e.preventDefault();
    setNewsMsg({ text: '', type: '' });

    if (!newsTitle || !newsContent || !newsCategory) {
      setNewsMsg({ text: 'Title, content and category are required', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('title', newsTitle);
    formData.append('content', newsContent);
    formData.append('category', newsCategory);
    formData.append('author', newsAuthor);
    
    if (newsImageFile) {
      formData.append('image', newsImageFile);
    } else {
      formData.append('image_url', newsImagePlaceholder);
    }

    fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setNewsMsg({ text: data.error, type: 'error' });
        } else {
          setNewsMsg({ text: '✅ Article created successfully!', type: 'success' });
          // Reset form
          setNewsTitle('');
          setNewsContent('');
          setNewsAuthor('');
          setNewsImageFile(null);
          // Reload
          loadDashboardData();
        }
      })
      .catch(err => {
        setNewsMsg({ text: 'Server error. Failed to add article.', type: 'error' });
      });
  };

  // Delete Article
  const handleDeleteArticle = (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    fetch(`/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => {
        loadDashboardData();
      })
      .catch(err => console.error(err));
  };

  // 🔴 Add Ticker message
  const handleAddTicker = (e) => {
    e.preventDefault();
    setTickerMsg({ text: '', type: '' });

    if (!tickerText) return;

    fetch('/api/admin/ticker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: tickerText })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setTickerMsg({ text: data.error, type: 'error' });
        } else {
          setTickerMsg({ text: '✅ Ticker message added!', type: 'success' });
          setTickerText('');
          loadDashboardData();
        }
      });
  };

  const handleDeleteTicker = (id) => {
    fetch(`/api/admin/ticker/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => loadDashboardData());
  };

  // 📹 Add Video Submit
  const handleAddVideo = (e) => {
    e.preventDefault();
    setVideoMsg({ text: '', type: '' });

    if (!videoTitle || !videoDuration) return;

    fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: videoTitle,
        duration: videoDuration,
        video_url: videoUrl,
        image_url: videoImagePlaceholder
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setVideoMsg({ text: data.error, type: 'error' });
        } else {
          setVideoMsg({ text: '✅ Video added successfully!', type: 'success' });
          setVideoTitle('');
          setVideoDuration('');
          loadDashboardData();
        }
      });
  };

  const handleDeleteVideo = (id) => {
    fetch(`/api/admin/videos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => loadDashboardData());
  };

  // 💬 Add Opinion Submit
  const handleAddOpinion = (e) => {
    e.preventDefault();
    setOpinionMsg({ text: '', type: '' });

    if (!opinionAuthor || !opinionHeadline || !opinionQuote) return;

    fetch('/api/admin/opinions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        author_name: opinionAuthor,
        author_role: opinionRole,
        author_avatar: opinionAvatar,
        headline: opinionHeadline,
        quote: opinionQuote
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setOpinionMsg({ text: data.error, type: 'error' });
        } else {
          setOpinionMsg({ text: '✅ Opinion piece published!', type: 'success' });
          setOpinionAuthor('');
          setOpinionRole('');
          setOpinionHeadline('');
          setOpinionQuote('');
          loadDashboardData();
        }
      });
  };

  const handleDeleteOpinion = (id) => {
    fetch(`/api/admin/opinions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => loadDashboardData());
  };

  // 📊 Set New Poll Submit
  const handleSetPoll = (e) => {
    e.preventDefault();
    setPollMsg({ text: '', type: '' });

    if (!pollQuestion || !pollOption1 || !pollOption2) {
      setPollMsg({ text: 'Question and at least 2 options are required', type: 'error' });
      return;
    }

    const options = [pollOption1, pollOption2];
    if (pollOption3) options.push(pollOption3);
    if (pollOption4) options.push(pollOption4);

    fetch('/api/admin/poll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question: pollQuestion, options })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setPollMsg({ text: data.error, type: 'error' });
        } else {
          setPollMsg({ text: '✅ New active poll initialized!', type: 'success' });
          setPollQuestion('');
          setPollOption1('');
          setPollOption2('');
          setPollOption3('');
          setPollOption4('');
          loadDashboardData();
        }
      });
  };

  const handleDownloadBackup = () => {
    fetch('/api/admin/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Backup download failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `samachar_sangarah_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => alert(err.message));
  };

  // Category list matching our UI (standard categories + all 31 districts of Karnataka)
  const categories = [
    'ರಾಜ್ಯ', 'ರಾಷ್ಟ್ರ', 'ಅಂತರರಾಷ್ಟ್ರೀಯ', 'ರಾಜಕೀಯ', 'ಕ್ರೀಡೆ', 'IPL 2025', 'ಮನರಂಜನೆ', 'ತಂತ್ರಜ್ಞಾನ', 'ಆರೋಗ್ಯ', 'ಅಭಿಪ್ರಾಯ',
    'ಬೆಂಗಳೂರು', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'ಮೈಸೂರು', 'ಮಂಗಳೂರು', 'ಹುಬ್ಬಳ್ಳಿ', 'ಧಾರವಾಡ', 'ಬೆಳಗಾವಿ',
    'ಕಲಬುರಗಿ', 'ಬಾಗಲಕೋಟೆ', 'ಬಳ್ಳಾರಿ', 'ಬೀದರ್', 'ಚಾಮರಾಜನಗರ', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'ಚಿಕ್ಕಮಗಳೂರು',
    'ಚಿತ್ರದುರ್ಗ', 'ದಾವಣಗೆರೆ', 'ಗದಗ', 'ಹಾಸನ', 'ಹಾವೇರಿ', 'ಕೊಡಗು', 'ಕೋಲಾರ', 'ಕೊಪ್ಪಳ', 'ಮಂಡ್ಯ',
    'ರಾಯಚೂರು', 'ರಾಮನಗರ', 'ಶಿವಮೊಗ್ಗ', 'ತುಮಕೂರು', 'ಉಡುಪಿ', 'ಉತ್ತರ ಕನ್ನಡ', 'ವಿಜಯನಗರ',
    'ವಿಜಯಪುರ', 'ಯಾದಗಿರಿ'
  ];

  // If token is missing, show Login Form
  if (!token) {
    return (
      <div className="admin-body">
        <div className="admin-login-card">
          <h2>ಸಮಾಚಾರ ಸಂಗ್ರಹ</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--admin-text-muted)', marginBottom: '20px' }}>
            ಅಡ್ಮಿನ್‌ ಲಾಗಿನ್ | ADMIN BACKOFFICE
          </p>
          <form onSubmit={handleLogin}>
            {authError && <div className="error-msg">{authError}</div>}
            <div className="admin-form-group">
              <label>Username</label>
              <input 
                className="admin-input" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="admin-form-group">
              <label>Password</label>
              <input 
                className="admin-input" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button className="admin-btn" type="submit">LOGIN</button>
            <button 
              className="admin-btn" 
              type="button" 
              onClick={() => navigate('/')} 
              style={{ marginTop: '10px', background: '#475569', color: '#fff' }}
            >
              GO TO CLIENT WEBSITE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <div className="admin-dashboard-wrap">
        
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>ಸಮಾಚಾರ ಸಂಗ್ರಹ - Admin Dashboard</h1>
            <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>ಸ್ಥಿತಿ: ಲಾಗ್ ಇನ್ ಆಗಿದೆ (ಅಡ್ಮಿನ್)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-btn" onClick={handleDownloadBackup} style={{ background: '#059669', color: '#fff', width: 'auto' }}>
              💾 Download Backup
            </button>
            <button className="admin-btn" onClick={() => navigate('/')} style={{ background: '#475569', color: '#fff', width: 'auto' }}>
              🌐 View Site
            </button>
            <button className="admin-btn-danger" onClick={handleLogout}>
              Logout 🔒
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
            📰 News Articles
          </button>
          <button className={`admin-nav-item ${activeTab === 'ticker' ? 'active' : ''}`} onClick={() => setActiveTab('ticker')}>
            🔴 Ticker Tape
          </button>
          <button className={`admin-nav-item ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
            📹 Videos
          </button>
          <button className={`admin-nav-item ${activeTab === 'opinions' ? 'active' : ''}`} onClick={() => setActiveTab('opinions')}>
            💬 Opinions
          </button>
          <button className={`admin-nav-item ${activeTab === 'poll' ? 'active' : ''}`} onClick={() => setActiveTab('poll')}>
            📊 Live Poll
          </button>
          <button className={`admin-nav-item ${activeTab === 'newsletter' ? 'active' : ''}`} onClick={() => setActiveTab('newsletter')}>
            📧 Subscribers ({subscribers.length})
          </button>
        </div>

        {/* Dashboard Grid Panel content */}
        
        {/* 1. NEWS ARTICLES TAB */}
        {activeTab === 'news' && (
          <div className="admin-grid-layout">
            {/* Add News */}
            <div className="admin-card">
              <h2>Post New Article</h2>
              <form onSubmit={handleAddArticle}>
                {newsMsg.text && (
                  <div className={newsMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {newsMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Title (ಸುದ್ದಿ ಶೀರ್ಷಿಕೆ)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={newsTitle} 
                    onChange={(e) => setNewsTitle(e.target.value)} 
                    required 
                    placeholder="E.g., ಮೆಟ್ರೋ ಹೊಸ ಮಾರ್ಗ ಉದ್ಘಾಟನೆ"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Content (ಸುದ್ದಿ ವಿವರ)</label>
                  <textarea 
                    className="admin-input admin-textarea" 
                    value={newsContent} 
                    onChange={(e) => setNewsContent(e.target.value)} 
                    required 
                    placeholder="ಇಲ್ಲಿ ವಿವರವಾದ ಸುದ್ದಿ ಪಠ್ಯವನ್ನು ಬರೆಯಿರಿ..."
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Category (ವರ್ಗ)</label>
                    <select 
                      className="admin-input" 
                      value={newsCategory} 
                      onChange={(e) => setNewsCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Author (ಲೇಖಕರು)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={newsAuthor} 
                      onChange={(e) => setNewsAuthor(e.target.value)} 
                      placeholder="E.g., ರಾಜೇಶ್ ಹೆಗ್ಡೆ"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Article Image Source</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="radio" 
                        name="img_source" 
                        defaultChecked 
                        onChange={() => setNewsImageFile(null)} 
                      />
                      Use CSS Gradient Placeholder
                    </label>
                    <select 
                      className="admin-input" 
                      value={newsImagePlaceholder} 
                      onChange={(e) => setNewsImagePlaceholder(e.target.value)}
                      disabled={newsImageFile !== null}
                    >
                      <option value="ph ph-red">Red Gradient</option>
                      <option value="ph ph-blue">Blue Gradient</option>
                      <option value="ph ph-green">Green Gradient</option>
                      <option value="ph ph-orange">Orange Gradient</option>
                      <option value="ph ph-purple">Purple Gradient</option>
                      <option value="ph ph-teal">Teal Gradient</option>
                      <option value="ph ph-dark">Charcoal Gradient</option>
                    </select>
                    
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <input 
                        type="radio" 
                        name="img_source" 
                        id="img_upload_radio" 
                      />
                      Upload Custom Image File
                    </label>
                    <input 
                      type="file" 
                      className="admin-input" 
                      accept="image/*"
                      onChange={(e) => {
                        setNewsImageFile(e.target.files[0]);
                        document.getElementById('img_upload_radio').checked = true;
                      }}
                    />
                  </div>
                </div>
                
                <button className="admin-btn" type="submit" style={{ marginTop: '10px' }}>
                  Publish News 🚀
                </button>
              </form>
            </div>

            {/* List News */}
            <div className="admin-card" style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h2>Recent Articles ({articles.length})</h2>
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={newsSearch} 
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="admin-input"
                  style={{ width: '200px', margin: 0, padding: '6px 12px', fontSize: '12px' }}
                />
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {articles
                    .filter(art => 
                      art.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
                      art.category.toLowerCase().includes(newsSearch.toLowerCase())
                    )
                    .map(art => (
                      <tr key={art.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{art.title}</td>
                        <td><span className="badge-admin-cat">{art.category}</span></td>
                        <td>{new Date(art.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="admin-btn-danger" onClick={() => handleDeleteArticle(art.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TICKER TAPE TAB */}
        {activeTab === 'ticker' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Add Ticker Tape Item</h2>
              <form onSubmit={handleAddTicker}>
                {tickerMsg.text && (
                  <div className={tickerMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {tickerMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Ticker Message (ತಾಜಾ ಸುದ್ದಿ ಪಠ್ಯ)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={tickerText} 
                    onChange={(e) => setTickerText(e.target.value)} 
                    required 
                    placeholder="ಬಜೆಟ್ ಮಂಡನೆ ಮಾರ್ಚ್ 7 ರಂದು..."
                  />
                </div>
                <button className="admin-btn" type="submit">Add Ticker Line 🔴</button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Active Ticker Items</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickerItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: '#fff' }}>{item.message}</td>
                      <td>
                        <button className="admin-btn-danger" onClick={() => handleDeleteTicker(item.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Add Video Link</h2>
              <form onSubmit={handleAddVideo}>
                {videoMsg.text && (
                  <div className={videoMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {videoMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Video Title (ವಿಡಿಯೋ ಶೀರ್ಷಿಕೆ)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={videoTitle} 
                    onChange={(e) => setVideoTitle(e.target.value)} 
                    required 
                    placeholder="E.g., ಕಾಂತಾರ-2 ಶೂಟಿಂಗ್ ಫಸ್ಟ್ ಲುಕ್"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Duration (ಅವಧಿ)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={videoDuration} 
                      onChange={(e) => setVideoDuration(e.target.value)} 
                      required 
                      placeholder="E.g., 5:42"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Video URL</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                      placeholder="#"
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Thumbnail Placeholder Style</label>
                  <select 
                    className="admin-input" 
                    value={videoImagePlaceholder} 
                    onChange={(e) => setVideoImagePlaceholder(e.target.value)}
                  >
                    <option value="ph ph-red">Red Gradient</option>
                    <option value="ph ph-blue">Blue Gradient</option>
                    <option value="ph ph-orange">Orange Gradient</option>
                    <option value="ph ph-purple">Purple Gradient</option>
                    <option value="ph ph-teal">Teal Gradient</option>
                  </select>
                </div>
                <button className="admin-btn" type="submit">Add Video Card 📹</button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Videos List</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>{v.title}</td>
                      <td>{v.duration}</td>
                      <td>
                        <button className="admin-btn-danger" onClick={() => handleDeleteVideo(v.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. OPINIONS TAB */}
        {activeTab === 'opinions' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Write Opinion / Editorial</h2>
              <form onSubmit={handleAddOpinion}>
                {opinionMsg.text && (
                  <div className={opinionMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {opinionMsg.text}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Author Name (ಲೇಖಕರ ಹೆಸರು)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={opinionAuthor} 
                      onChange={(e) => setOpinionAuthor(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Role (ಪಾತ್ರ)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={opinionRole} 
                      onChange={(e) => setOpinionRole(e.target.value)} 
                      placeholder="ಹಿರಿಯ ಸಂಪಾದಕ"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Avatar Emoji</label>
                    <select 
                      className="admin-input" 
                      value={opinionAvatar} 
                      onChange={(e) => setOpinionAvatar(e.target.value)}
                    >
                      <option value="👨">👨 Man</option>
                      <option value="👩">👩 Woman</option>
                      <option value="👨‍💼">👨‍💼 Business Man</option>
                      <option value="👩‍💼">👩‍💼 Business Woman</option>
                      <option value="👴">👴 Elder Man</option>
                      <option value="👵">👵 Elder Woman</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Opinion Headline (ಮುಖ್ಯ ಹೆಡ್‌ಲೈನ್)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={opinionHeadline} 
                    onChange={(e) => setOpinionHeadline(e.target.value)} 
                    required 
                    placeholder="E.g., ಕರ್ನಾಟಕದ ನೀರಾವರಿ ಬಿಕ್ಕಟ್ಟು — ನಾವು ಎಲ್ಲಿ ತಪ್ಪಾದೆವು?"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Quote Content (ಅಭಿಪ್ರಾಯದ ಆಯ್ದ ಭಾಗ)</label>
                  <textarea 
                    className="admin-input admin-textarea" 
                    value={opinionQuote} 
                    onChange={(e) => setOpinionQuote(e.target.value)} 
                    required 
                    placeholder="ಕಾವೇರಿ ನೀರಿನ ವಿವಾದ ಹಳೆಯದಾದರೂ ಪರಿಹಾರ ಇಂದಿಗೂ ಮರೀಚಿಕೆಯಾಗಿದೆ..."
                  />
                </div>
                <button className="admin-btn" type="submit">Publish Opinion 💬</button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Editorials List</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Headline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {opinions.map(op => (
                    <tr key={op.id}>
                      <td style={{ color: '#fff' }}>{op.author_avatar} {op.author_name}</td>
                      <td>{op.headline}</td>
                      <td>
                        <button className="admin-btn-danger" onClick={() => handleDeleteOpinion(op.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. POLL TAB */}
        {activeTab === 'poll' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Set Up New Active Poll</h2>
              <form onSubmit={handleSetPoll}>
                {pollMsg.text && (
                  <div className={pollMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {pollMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Question (ಮತದಾನದ ಪ್ರಶ್ನೆ)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={pollQuestion} 
                    onChange={(e) => setPollQuestion(e.target.value)} 
                    required 
                    placeholder="2028 ಕರ್ನಾಟಕ ಚುನಾವಣೆಯಲ್ಲಿ ಯಾರು ಗೆಲ್ಲಬಹುದು?"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Option 1 (ಆಯ್ಕೆ 1)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={pollOption1} 
                      onChange={(e) => setPollOption1(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Option 2 (ಆಯ್ಕೆ 2)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={pollOption2} 
                      onChange={(e) => setPollOption2(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label>Option 3 (ಆಯ್ಕೆ 3 - Optional)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={pollOption3} 
                      onChange={(e) => setPollOption3(e.target.value)} 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Option 4 (ಆಯ್ಕೆ 4 - Optional)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={pollOption4} 
                      onChange={(e) => setPollOption4(e.target.value)} 
                    />
                  </div>
                </div>

                <button className="admin-btn" type="submit" style={{ marginTop: '10px' }}>
                  Launch New Active Poll 📊
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Current Live Poll</h2>
              {activePoll ? (
                <div>
                  <h3 style={{ color: '#fff', fontSize: '15px', marginBottom: '14px' }}>Q: {activePoll.question}</h3>
                  {activePoll.options.map(opt => {
                    const votes = activePoll.votes[opt] || 0;
                    return (
                      <div key={opt} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span>{opt}</span>
                          <strong>{votes} votes</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No active poll set.</p>
              )}
            </div>
          </div>
        )}

        {/* 6. SUBSCRIBERS TAB */}
        {activeTab === 'newsletter' && (
          <div className="admin-card" style={{ width: '100%' }}>
            <h2>Newsletter Subscribers List ({subscribers.length})</h2>
            {subscribers.length === 0 ? (
              <p>No subscribers yet.</p>
            ) : (
              <table className="admin-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Subscribed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ color: 'var(--admin-accent)', fontWeight: 600, fontSize: '14px' }}>{sub.email}</td>
                      <td>{new Date(sub.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
