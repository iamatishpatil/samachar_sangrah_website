import React, { useState, useEffect } from 'react';

function AdminDashboard({ navigate }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Tooltip states for charts
  const [visitorTooltip, setVisitorTooltip] = useState(null);
  const [installTooltip, setInstallTooltip] = useState(null);
  const [categoryTooltip, setCategoryTooltip] = useState(null);

  // Loaded database states
  const [articles, setArticles] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [photos, setPhotos] = useState([]);

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
  const [videoUrl, setVideoUrl] = useState('');
  const [videoImageFile, setVideoImageFile] = useState(null);
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

  // Add Admin Form
  const [newAdminMobile, setNewAdminMobile] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState(null);

  // Photo Form
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoImageFile, setPhotoImageFile] = useState(null);
  const [photoImagePlaceholder, setPhotoImagePlaceholder] = useState('ph ph-red');
  const [photoMsg, setPhotoMsg] = useState({ text: '', type: '' });

  // Real-time Analytics state
  const [analytics, setAnalytics] = useState({
    totalArticles: 0,
    totalCategories: 0,
    totalSubscribers: 0,
    totalViews: 0,
    storyViews: 0,
    articleViews: 0
  });

  // Edit Article Form States
  const [editingArticle, setEditingArticle] = useState(null);
  const [editNewsTitle, setEditNewsTitle] = useState('');
  const [editNewsContent, setEditNewsContent] = useState('');
  const [editNewsCategory, setEditNewsCategory] = useState('ರಾಜ್ಯ');
  const [editNewsAuthor, setEditNewsAuthor] = useState('');
  const [editNewsImageFile, setEditNewsImageFile] = useState(null);
  const [editNewsImagePlaceholder, setEditNewsImagePlaceholder] = useState('ph ph-red');
  const [editNewsImageSource, setEditNewsImageSource] = useState('keep'); // 'keep', 'placeholder', 'upload'
  const [editNewsMsg, setEditNewsMsg] = useState({ text: '', type: '' });

  // Image Cropper States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [cropperFilename, setCropperFilename] = useState('');
  const [cropperCallback, setCropperCallback] = useState(null);

  const openImageCropper = (file, callback) => {
    if (!file) return;
    setCropperFilename(file.name);
    setCropperCallback(() => callback);
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

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

    fetch('/api/photos')
      .then(res => res.json())
      .then(data => setPhotos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch('/api/admin/analytics', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load analytics');
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setAnalytics(data);
        }
      })
      .catch(err => console.error('Error fetching analytics:', err));
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

  // 📰 Edit Article Submit
  const handleUpdateArticle = (e) => {
    e.preventDefault();
    setEditNewsMsg({ text: '', type: '' });

    if (!editingArticle) return;
    if (!editNewsTitle || !editNewsContent || !editNewsCategory) {
      setEditNewsMsg({ text: 'Title, content and category are required', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('title', editNewsTitle);
    formData.append('content', editNewsContent);
    formData.append('category', editNewsCategory);
    formData.append('author', editNewsAuthor);
    
    if (editNewsImageSource === 'upload' && editNewsImageFile) {
      formData.append('image', editNewsImageFile);
    } else if (editNewsImageSource === 'placeholder') {
      formData.append('image_url', editNewsImagePlaceholder);
    } else {
      // Keep existing image
      formData.append('image_url', editingArticle.image_url);
    }

    fetch(`/api/admin/news/${editingArticle.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setEditNewsMsg({ text: data.error, type: 'error' });
        } else {
          setEditNewsMsg({ text: '✅ Article updated successfully!', type: 'success' });
          // Clear edit mode after short delay
          setTimeout(() => {
            setEditingArticle(null);
            setEditNewsTitle('');
            setEditNewsContent('');
            setEditNewsAuthor('');
            setEditNewsImageFile(null);
            setEditNewsMsg({ text: '', type: '' });
          }, 1000);
          // Reload
          loadDashboardData();
        }
      })
      .catch(err => {
        setEditNewsMsg({ text: 'Server error. Failed to update article.', type: 'error' });
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

    if (!videoTitle) return;

    const formData = new FormData();
    formData.append('title', videoTitle);
    formData.append('duration', videoDuration);
    formData.append('video_url', videoUrl);

    if (videoImageFile) {
      formData.append('image', videoImageFile);
    } else {
      formData.append('image_url', videoImagePlaceholder);
    }

    fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
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

  // 📷 Add Photo Submit
  const handleAddPhoto = (e) => {
    e.preventDefault();
    setPhotoMsg({ text: '', type: '' });

    const formData = new FormData();
    formData.append('caption', photoCaption);
    
    if (photoImageFile) {
      formData.append('image', photoImageFile);
    } else {
      formData.append('image_url', photoImagePlaceholder);
    }

    fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setPhotoMsg({ text: data.error, type: 'error' });
        } else {
          setPhotoMsg({ text: '✅ Photo added to gallery!', type: 'success' });
          setPhotoCaption('');
          setPhotoImageFile(null);
          loadDashboardData();
        }
      })
      .catch(err => {
        setPhotoMsg({ text: 'Server error. Failed to add photo.', type: 'error' });
      });
  };

  const handleDeletePhoto = (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    fetch(`/api/admin/photos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => loadDashboardData());
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
    'ಮುಖಪುಟ', 'ರಾಜ್ಯ', 'ರಾಷ್ಟ್ರ', 'ಅಂತರರಾಷ್ಟ್ರೀಯ', 'ರಾಜಕೀಯ', 'ಕ್ರೀಡೆ', 'IPL 2025', 'ಮನರಂಜನೆ', 'ತಂತ್ರಜ್ಞಾನ', 'ಆರೋಗ್ಯ', 'ಪ್ರಚಲಿತ ವಿದ್ಯಮಾನಗಳು', 'ಟ್ರೆಂಡಿಂಗ್',
    'ಬೆಂಗಳೂರು', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'ಮೈಸೂರು', 'ಮಂಗಳೂರು', 'ಹುಬ್ಬಳ್ಳಿ', 'ಧಾರವಾಡ', 'ಬೆಳಗಾವಿ',
    'ಕಲಬುರಗಿ', 'ಬಾಗಲಕೋಟೆ', 'ಬಳ್ಳಾರಿ', 'ಬೀದರ್', 'ಚಾಮರಾಜನಗರ', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'ಚಿಕ್ಕಮಗಳೂರು',
    'ಚಿತ್ರದುರ್ಗ', 'ದಾವಣಗೆರೆ', 'ಗದಗ', 'ಹಾಸನ', 'ಹಾವೇರಿ', 'ಕೊಡಗು', 'ಕೋಲಾರ', 'ಕೊಪ್ಪಳ', 'ಮಂಡ್ಯ',
    'ರಾಯಚೂರು', 'ರಾಮನಗರ', 'ಶಿವಮೊಗ್ಗ', 'ತುಮಕೂರು', 'ಉಡುಪಿ', 'ಉತ್ತರ ಕನ್ನಡ', 'ವಿಜಯನಗರ',
    'ವಿಜಯಪುರ', 'ಯಾದಗಿರಿ'
  ];

  const handleAddAdmin = (e) => {
    e.preventDefault();
    setAdminMsg(null);
    fetch('/api/admin/collaborators', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobileNumber: newAdminMobile, password: newAdminPassword })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || data.error) {
          setAdminMsg({ text: data.error || 'Failed to create admin.', type: 'error' });
        } else {
          setAdminMsg({ text: '✅ Admin account created successfully!', type: 'success' });
          setNewAdminMobile('');
          setNewAdminPassword('');
        }
      })
      .catch(err => setAdminMsg({ text: 'Server error.', type: 'error' }));
  };

  // If token is missing, show Login Form
  if (!token) {
    return (
      <div className="admin-body">
        <div className="admin-login-card">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img src="/IMG_1105.PNG" alt="ಸಮಾಚಾರ ಸಂಗ್ರಹ" style={{ height: '45px', width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
          </div>
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
    <div className="admin-layout">
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/IMG_1105.PNG" alt="ಸಮಾಚಾರ ಸಂಗ್ರಹ" style={{ height: '35px', width: 'auto', objectFit: 'contain', background: '#fff', padding: '4px 8px', borderRadius: '4px', margin: '0 auto', display: 'block' }} />
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>Admin Dashboard</p>
        </div>
        <div className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Analytics Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
            📰 News Articles
          </button>
          <button className={`admin-nav-item ${activeTab === 'ticker' ? 'active' : ''}`} onClick={() => setActiveTab('ticker')}>
            🔴 Ticker Tape
          </button>
          <button className={`admin-nav-item ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
            📹 Trending Reels
          </button>
          <button className={`admin-nav-item ${activeTab === 'poll' ? 'active' : ''}`} onClick={() => setActiveTab('poll')}>
            📊 Live Poll
          </button>
          <button className={`admin-nav-item ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            📷 Photo Gallery
          </button>
          <button className={`admin-nav-item ${activeTab === 'newsletter' ? 'active' : ''}`} onClick={() => setActiveTab('newsletter')}>
            📧 Subscribers ({subscribers.length})
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header */}
        <div className="admin-top-header">
          <h2>
            {activeTab === 'dashboard' ? 'Dashboard Overview' :
             activeTab === 'news' ? 'Manage News Articles' :
             activeTab === 'ticker' ? 'Ticker Tape' :
             activeTab === 'videos' ? 'Trending Reels' :
             activeTab === 'poll' ? 'Live Poll' :
             activeTab === 'photos' ? 'Photo Gallery' :
             'Subscribers'}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-btn" onClick={handleDownloadBackup} style={{ background: '#059669', color: '#fff', width: 'auto' }}>
              💾 Download Backup
            </button>
            <button className="admin-btn" onClick={() => navigate('/')} style={{ background: '#475569', color: '#fff', width: 'auto' }}>
              🌐 View Site
            </button>
            <button className="admin-btn-danger" onClick={handleLogout} style={{ width: 'auto' }}>
              Logout 🔒
            </button>
          </div>
        </div>

        {/* Dashboard Grid Panel content */}
        
        {/* 0. ANALYTICS DASHBOARD TAB */}
        {activeTab === 'dashboard' && (() => {
          const calculateDaysLeft = () => {
            const expiryDate = new Date('2027-05-11');
            const currentDate = new Date('2026-06-06T22:08:05+05:30'); // Anchor to current time context
            const diffTime = expiryDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
          };

          const visitorData = [
            { label: 'Jul', val: 120 },
            { label: 'Aug', val: 150 },
            { label: 'Sep', val: 110 },
            { label: 'Oct', val: 180 },
            { label: 'Nov', val: 210 },
            { label: 'Dec', val: 160 },
            { label: 'Jan', val: 240 },
            { label: 'Feb', val: 280 },
            { label: 'Mar', val: 190 },
            { label: 'Apr', val: 75430 },
            { label: 'May', val: 122463 },
            { label: 'Jun', val: analytics.totalViews }
          ];

          const installData = [
            { label: 'Jul', val: 0 },
            { label: 'Aug', val: 0 },
            { label: 'Sep', val: 0 },
            { label: 'Oct', val: 0 },
            { label: 'Nov', val: 0 },
            { label: 'Dec', val: 0 },
            { label: 'Jan', val: 0 },
            { label: 'Feb', val: 0 },
            { label: 'Mar', val: 0 },
            { label: 'Apr', val: 0 },
            { label: 'May', val: 0 },
            { label: 'Jun', val: 0 }
          ];

          const categoryCounts = {};
          articles.forEach(art => {
            const cat = art.category || 'ರಾಜ್ಯ';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          });

          let rawCategoryData = Object.entries(categoryCounts)
            .map(([label, val]) => ({ label, val }))
            .sort((a, b) => b.val - a.val);

          if (rawCategoryData.length === 0) {
            rawCategoryData = [
              { label: 'ರಾಜ್ಯ', val: 10 },
              { label: 'ರಾಷ್ಟ್ರ', val: 8 },
              { label: 'ಕ್ರೀಡೆ', val: 6 },
              { label: 'ರಾಜಕೀಯ', val: 4 },
              { label: 'ಮನರಂಜನೆ', val: 3 }
            ];
          }

          const activeCategoryData = rawCategoryData.slice(0, 10);
          const maxCategoryVal = Math.max(...activeCategoryData.map(d => d.val), 10);

          const maxVisitorValRaw = Math.max(...visitorData.map(d => d.val), 10);
          const maxVisitorVal = Math.max(Math.ceil(maxVisitorValRaw * 1.2), 100);
          const visitorTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(pct => Math.round(pct * maxVisitorVal));

          const getVisitorPath = () => {
            return pointsToCubicSvg(visitorData.map((d, i) => ({
              x: 80 + i * (860 / 11),
              y: 260 - (d.val / maxVisitorVal) * 220
            })));
          };

          const getVisitorAreaPath = () => {
            const linePoints = visitorData.map((d, i) => ({
              x: 80 + i * (860 / 11),
              y: 260 - (d.val / maxVisitorVal) * 220
            }));
            const line = pointsToCubicSvg(linePoints);
            const startX = 80;
            const endX = 80 + 11 * (860 / 11);
            return `${line} L ${endX} 260 L ${startX} 260 Z`;
          };

          const getCategoryPath = () => {
            const den = Math.max(activeCategoryData.length - 1, 1);
            return pointsToCubicSvg(activeCategoryData.map((d, i) => ({
              x: 80 + i * (860 / den),
              y: 260 - (d.val / maxCategoryVal) * 220
            })));
          };

          const getCategoryAreaPath = () => {
            const den = Math.max(activeCategoryData.length - 1, 1);
            const linePoints = activeCategoryData.map((d, i) => ({
              x: 80 + i * (860 / den),
              y: 260 - (d.val / maxCategoryVal) * 220
            }));
            const line = pointsToCubicSvg(linePoints);
            const startX = 80;
            const endX = 80 + (activeCategoryData.length - 1) * (860 / den);
            return `${line} L ${endX} 260 L ${startX} 260 Z`;
          };

          const maxInstallValRaw = Math.max(...installData.map(d => d.val), 10);
          const maxInstallVal = Math.max(Math.ceil(maxInstallValRaw * 1.2), 10);
          const installTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(pct => Math.round(pct * maxInstallVal));

          const getInstallPath = () => {
            return installData.map((d, i) => {
              const x = 80 + i * (860 / 11);
              const y = 260 - (d.val / maxInstallVal) * 220;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
          };

          const getInstallAreaPath = () => {
            const line = getInstallPath();
            const startX = 80;
            const endX = 80 + 11 * (860 / 11);
            return `${line} L ${endX} 260 L ${startX} 260 Z`;
          };

          // Helper to smooth out points with a cubic curve
          function pointsToCubicSvg(pts) {
            if (pts.length === 0) return '';
            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const p0 = pts[i];
              const p1 = pts[i + 1];
              // Control points for smooth curve
              const cpX1 = p0.x + (p1.x - p0.x) / 3;
              const cpY1 = p0.y;
              const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
              const cpY2 = p1.y;
              d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
            }
            return d;
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.25s ease' }}>
              {/* Top info strip removed per request */}

              {/* Stats Cards Row */}
              <div className="db-stats-grid">
                <div className="db-stat-card purple">
                  <div className="db-stat-label">Articles</div>
                  <div className="db-stat-value">{analytics.totalArticles.toLocaleString()}</div>
                  <div className="db-stat-icon">📰</div>
                </div>
                <div className="db-stat-card blue">
                  <div className="db-stat-label">Categories</div>
                  <div className="db-stat-value">{analytics.totalCategories.toLocaleString()}</div>
                  <div className="db-stat-icon">🏷️</div>
                </div>
                <div className="db-stat-card green">
                  <div className="db-stat-label">Subscribers</div>
                  <div className="db-stat-value">{analytics.totalSubscribers.toLocaleString()}</div>
                  <div className="db-stat-icon">👥</div>
                </div>
                <div className="db-stat-card orange">
                  <div className="db-stat-label">Total Views</div>
                  <div className="db-stat-value">{analytics.totalViews.toLocaleString()}</div>
                  <div className="db-stat-icon">⏳</div>
                </div>
                <div className="db-stat-card pink">
                  <div className="db-stat-label">Story Views</div>
                  <div className="db-stat-value">{analytics.storyViews.toLocaleString()}</div>
                  <div className="db-stat-icon">🖼️</div>
                </div>
                <div className="db-stat-card teal">
                  <div className="db-stat-label">Latest Post</div>
                  <div className="db-stat-value" style={{ fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', marginTop: '6px' }}>
                    {articles.length > 0 ? articles[0].title : 'No articles'}
                  </div>
                  <div className="db-stat-icon" style={{ opacity: 0.15 }}>📢</div>
                </div>
              </div>

              {/* Main Charts & Widgets Grid */}
              <div className="admin-grid-layout">
                {/* Column 1: Line Chart */}
                <div className="db-visitor-chart-card">
                  <div className="db-chart-header">
                    <div>
                      <h3 className="db-chart-title">Visitor Analytics</h3>
                    </div>
                    <div className="db-chart-legend">
                      This Month's Visitors: <span>{analytics.totalViews.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="db-svg-chart-container">
                    <svg viewBox="0 0 1000 320" className="db-svg-chart">
                      <defs>
                        <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3dd580" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3dd580" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {visitorTicks.map((v) => {
                        const y = 260 - (v / maxVisitorVal) * 220;
                        return (
                          <g key={v}>
                            <line x1="80" y1={y} x2="940" y2={y} className="db-chart-grid-line" />
                            <text x="70" y={y + 4} className="db-chart-label-y">{v.toLocaleString()}</text>
                          </g>
                        );
                      })}

                      {/* X Axis Labels */}
                      {visitorData.map((d, i) => {
                        const x = 80 + i * (860 / 11);
                        return (
                          <g key={d.label}>
                            <line x1={x} y1="260" x2={x} y2="265" className="db-chart-axis-line" />
                            <text x={x} y="285" className="db-chart-label">{d.label}</text>
                          </g>
                        );
                      })}

                      {/* Area Under Line */}
                      <path d={getVisitorAreaPath()} className="db-chart-area green" />

                      {/* Line Path */}
                      <path d={getVisitorPath()} className="db-chart-line green" />

                      {/* Guide Dotted Line */}
                      {visitorTooltip && (
                        <line 
                          x1={visitorTooltip.x} 
                          y1={visitorTooltip.y} 
                          x2={visitorTooltip.x} 
                          y2="260" 
                          stroke="#3dd580" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                      )}

                      {/* Interactive Dots */}
                      {visitorData.map((d, i) => {
                        const x = 80 + i * (860 / 11);
                        const y = 260 - (d.val / maxVisitorVal) * 220;
                        const isHovered = visitorTooltip && visitorTooltip.label === d.label;
                        return (
                          <g key={d.label}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isHovered ? 6 : 4} 
                              className={`db-chart-point green ${isHovered ? 'active' : ''}`} 
                            />
                            {/* Larger invisible overlay for easier mouse hovering */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="20" 
                              fill="transparent" 
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setVisitorTooltip({ x, y, label: d.label, val: d.val })}
                              onMouseLeave={() => setVisitorTooltip(null)}
                              onMouseMove={() => setVisitorTooltip({ x, y, label: d.label, val: d.val })}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip Card overlay */}
                    {visitorTooltip && (
                      <div 
                        className="db-chart-tooltip" 
                        style={{ 
                          left: `${(visitorTooltip.x / 1000) * 100}%`, 
                          top: `${(visitorTooltip.y / 320) * 100}%` 
                        }}
                      >
                        <strong>{visitorTooltip.label}</strong>: {visitorTooltip.val.toLocaleString()} views
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Collaborative Admin */}
                <div>
                  <div className="admin-card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--admin-text-muted)', fontWeight: 800 }}>
                      Add Admin Account
                    </h2>
                    <form onSubmit={handleAddAdmin}>
                      {adminMsg && <div className={adminMsg.type === 'error' ? 'error-msg' : 'success-msg'} style={{ marginBottom: '12px' }}>{adminMsg.text}</div>}
                      <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>Mobile Number</label>
                        <input 
                          className="admin-input" 
                          type="text" 
                          value={newAdminMobile} 
                          onChange={(e) => setNewAdminMobile(e.target.value)} 
                          placeholder="e.g. 9876543210"
                          required 
                        />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
                        <input 
                          className="admin-input" 
                          type="password" 
                          value={newAdminPassword} 
                          onChange={(e) => setNewAdminPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <button className="admin-btn" type="submit">Create Admin</button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Second Row Charts */}
              <div className="admin-grid-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* App Installation */}
                <div className="db-visitor-chart-card">
                  <div className="db-chart-header">
                    <div>
                      <h3 className="db-chart-title">App Installation (News Reads)</h3>
                    </div>
                  </div>

                  <div className="db-svg-chart-container">
                    <svg viewBox="0 0 1000 320" className="db-svg-chart">
                      <defs>
                        <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ca1f5" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#4ca1f5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {installTicks.map((v) => {
                        const y = 260 - (v / maxInstallVal) * 220;
                        return (
                          <g key={v}>
                            <line x1="80" y1={y} x2="940" y2={y} className="db-chart-grid-line" />
                            <text x="70" y={y + 4} className="db-chart-label-y">{v.toLocaleString()}</text>
                          </g>
                        );
                      })}

                      {/* X Axis Labels */}
                      {installData.map((d, i) => {
                        const x = 80 + i * (860 / 11);
                        return (
                          <g key={d.label}>
                            <line x1={x} y1="260" x2={x} y2="265" className="db-chart-axis-line" />
                            <text x={x} y="285" className="db-chart-label">{d.label}</text>
                          </g>
                        );
                      })}

                      {/* Area Under Line */}
                      <path d={getInstallAreaPath()} className="db-chart-area blue" />

                      {/* Line Path */}
                      <path d={getInstallPath()} className="db-chart-line blue" />

                      {/* Guide Dotted Line */}
                      {installTooltip && (
                        <line 
                          x1={installTooltip.x} 
                          y1={installTooltip.y} 
                          x2={installTooltip.x} 
                          y2="260" 
                          stroke="#4ca1f5" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                      )}

                      {/* Interactive Dots */}
                      {installData.map((d, i) => {
                        const x = 80 + i * (860 / 11);
                        const y = 260 - (d.val / maxInstallVal) * 220;
                        const isHovered = installTooltip && installTooltip.label === d.label;
                        return (
                          <g key={d.label}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isHovered ? 6 : 4} 
                              className={`db-chart-point blue ${isHovered ? 'active' : ''}`} 
                            />
                            {/* Larger invisible overlay for easier mouse hovering */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="20" 
                              fill="transparent" 
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setInstallTooltip({ x, y, label: d.label, val: d.val })}
                              onMouseLeave={() => setInstallTooltip(null)}
                              onMouseMove={() => setInstallTooltip({ x, y, label: d.label, val: d.val })}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip Card overlay */}
                    {installTooltip && (
                      <div 
                        className="db-chart-tooltip" 
                        style={{ 
                          left: `${(installTooltip.x / 1000) * 100}%`, 
                          top: `${(installTooltip.y / 320) * 100}%` 
                        }}
                      >
                        <strong>{installTooltip.label}</strong>: {installTooltip.val} installs
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Analytics */}
                <div className="db-visitor-chart-card">
                  <div className="db-chart-header">
                    <div>
                      <h3 className="db-chart-title">Category Analytics</h3>
                    </div>
                  </div>

                  <div className="db-svg-chart-container">
                    <svg viewBox="0 0 1000 320" className="db-svg-chart">
                      <defs>
                        <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b074f1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#b074f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1.0].map(pct => pct * maxCategoryVal).map((v, i) => {
                        const y = 260 - (v / maxCategoryVal) * 220;
                        return (
                          <g key={i}>
                            <line x1="80" y1={y} x2="940" y2={y} className="db-chart-grid-line" />
                            <text x="70" y={y + 4} className="db-chart-label-y">{Math.round(v).toLocaleString()}</text>
                          </g>
                        );
                      })}

                      {/* X Axis Labels */}
                      {activeCategoryData.map((d, i) => {
                        const den = Math.max(activeCategoryData.length - 1, 1);
                        const x = 80 + i * (860 / den);
                        return (
                          <g key={d.label}>
                            <line x1={x} y1="260" x2={x} y2="265" className="db-chart-axis-line" />
                            <text 
                              x={x} 
                              y="280" 
                              className="db-chart-label" 
                              style={{ fontSize: '10px', textAnchor: 'end' }}
                              transform={`rotate(-25, ${x}, 280)`}
                            >
                              {d.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Under Line */}
                      <path d={getCategoryAreaPath()} className="db-chart-area purple" />

                      {/* Line Path */}
                      <path d={getCategoryPath()} className="db-chart-line purple" />

                      {/* Guide Dotted Line */}
                      {categoryTooltip && (
                        <line 
                          x1={categoryTooltip.x} 
                          y1={categoryTooltip.y} 
                          x2={categoryTooltip.x} 
                          y2="260" 
                          stroke="#b074f1" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                      )}

                      {/* Interactive Dots */}
                      {activeCategoryData.map((d, i) => {
                        const den = Math.max(activeCategoryData.length - 1, 1);
                        const x = 80 + i * (860 / den);
                        const y = 260 - (d.val / maxCategoryVal) * 220;
                        const isHovered = categoryTooltip && categoryTooltip.label === d.label;
                        return (
                          <g key={d.label}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isHovered ? 6 : 4} 
                              className={`db-chart-point purple ${isHovered ? 'active' : ''}`} 
                            />
                            {/* Larger invisible overlay for easier mouse hovering */}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="20" 
                              fill="transparent" 
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setCategoryTooltip({ x, y, label: d.label, val: d.val })}
                              onMouseLeave={() => setCategoryTooltip(null)}
                              onMouseMove={() => setCategoryTooltip({ x, y, label: d.label, val: d.val })}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Tooltip Card overlay */}
                    {categoryTooltip && (
                      <div 
                        className="db-chart-tooltip" 
                        style={{ 
                          left: `${(categoryTooltip.x / 1000) * 100}%`, 
                          top: `${(categoryTooltip.y / 320) * 100}%` 
                        }}
                      >
                        <strong>{categoryTooltip.label}</strong>: {categoryTooltip.val.toLocaleString()} views
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Viewed Articles Table */}
              <div className="admin-card" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Top Viewed Articles</h2>
                  <button className="admin-btn-secondary" onClick={() => setActiveTab('news')} style={{ padding: '6px 14px', fontSize: '12.5px', marginRight: 0 }}>
                    View All News
                  </button>
                </div>
                {articles.length === 0 ? (
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13.5px', padding: '10px 0' }}>No articles published yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>#</th>
                          <th style={{ width: '80px' }}>Image</th>
                          <th>Article Title</th>
                          <th style={{ width: '120px' }}>Views</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((art, index) => {
                          const views = art.views || 0;
                          
                          const renderThumbnail = () => {
                            if (art.image_url && art.image_url.startsWith('ph ph-')) {
                              return (
                                <div className={`db-table-icon-fallback ${art.image_url}`}>
                                  📰
                                </div>
                              );
                            } else if (art.image_url) {
                              return (
                                <img src={art.image_url} alt="thumbnail" className="db-table-thumb" />
                              );
                            }
                            return (
                              <div className="db-table-icon-fallback ph ph-dark">
                                📰
                              </div>
                            );
                          };

                          return (
                            <tr key={art.id}>
                              <td style={{ fontWeight: '700', color: 'var(--admin-text-muted)' }}>{index + 1}</td>
                              <td>{renderThumbnail()}</td>
                              <td style={{ fontWeight: '600' }}>{art.title}</td>
                              <td>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  👁️ {views.toLocaleString()}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="db-table-btn" onClick={() => navigate(`/article/${art.id}`)}>
                                  Open ↗
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 1. NEWS ARTICLES TAB */}
        {activeTab === 'news' && (
          <div className="admin-grid-layout">
            {/* Add News */}
            <div className="admin-card">
              {editingArticle ? (
                <>
                  <h2 style={{ color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✏️ Edit Article (ಸುದ್ದಿ ತಿದ್ದುಪಡಿ)
                  </h2>
                  <form onSubmit={handleUpdateArticle}>
                    {editNewsMsg.text && (
                      <div className={editNewsMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                        {editNewsMsg.text}
                      </div>
                    )}
                    <div className="admin-form-group">
                      <label>Title (ಸುದ್ದಿ ಶೀರ್ಷಿಕೆ)</label>
                      <input 
                        className="admin-input" 
                        type="text" 
                        value={editNewsTitle} 
                        onChange={(e) => setEditNewsTitle(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Content (ಸುದ್ದಿ ವಿವರ)</label>
                      <textarea 
                        className="admin-input admin-textarea" 
                        value={editNewsContent} 
                        onChange={(e) => setEditNewsContent(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="admin-form-group">
                        <label>Category (ವರ್ಗ)</label>
                        <select 
                          className="admin-input" 
                          value={editNewsCategory} 
                          onChange={(e) => setEditNewsCategory(e.target.value)}
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
                          value={editNewsAuthor} 
                          onChange={(e) => setEditNewsAuthor(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Article Image Option</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="edit_img_source" 
                            checked={editNewsImageSource === 'keep'} 
                            onChange={() => setEditNewsImageSource('keep')} 
                          />
                          Keep Existing Image
                        </label>
                        {editNewsImageSource === 'keep' && editingArticle.image_url && (
                          <div style={{ margin: '2px 0 6px 20px' }}>
                            {editingArticle.image_url.startsWith('ph ph-') ? (
                              <div className={`db-table-icon-fallback ${editingArticle.image_url}`} style={{ width: '80px', height: '45px', borderRadius: '4px' }}>📰</div>
                            ) : (
                              <img src={editingArticle.image_url} alt="Current" style={{ width: '100px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }} />
                            )}
                          </div>
                        )}
                        
                        <label style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="edit_img_source" 
                            checked={editNewsImageSource === 'placeholder'} 
                            onChange={() => setEditNewsImageSource('placeholder')} 
                          />
                          Use CSS Gradient Placeholder
                        </label>
                        <select 
                          className="admin-input" 
                          value={editNewsImagePlaceholder} 
                          onChange={(e) => setEditNewsImagePlaceholder(e.target.value)}
                          disabled={editNewsImageSource !== 'placeholder'}
                        >
                          <option value="ph ph-red">Red Gradient</option>
                          <option value="ph ph-blue">Blue Gradient</option>
                          <option value="ph ph-green">Green Gradient</option>
                          <option value="ph ph-orange">Orange Gradient</option>
                          <option value="ph ph-purple">Purple Gradient</option>
                          <option value="ph ph-teal">Teal Gradient</option>
                          <option value="ph ph-dark">Charcoal Gradient</option>
                        </select>
                        
                        <label style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="edit_img_source" 
                            checked={editNewsImageSource === 'upload'} 
                            onChange={() => setEditNewsImageSource('upload')} 
                            id="edit_img_upload_radio"
                          />
                          Upload & Crop New Image
                        </label>
                        <input 
                          type="file" 
                          className="admin-input" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              openImageCropper(file, (croppedFile) => {
                                setEditNewsImageFile(croppedFile);
                              });
                            }
                            setEditNewsImageSource('upload');
                            document.getElementById('edit_img_upload_radio').checked = true;
                          }}
                        />
                        {editNewsImageSource === 'upload' && editNewsImageFile && (
                          <div style={{ margin: '4px 0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 'bold' }}>✓ Image adjusted & ready</span>
                            <button type="button" className="admin-btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', margin: 0 }} onClick={() => openImageCropper(editNewsImageFile, (file) => setEditNewsImageFile(file))}>
                              Re-Adjust
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button className="admin-btn" type="submit" style={{ flex: 1 }}>
                        Save Edits 💾
                      </button>
                      <button 
                        className="admin-btn-secondary" 
                        type="button" 
                        onClick={() => setEditingArticle(null)}
                        style={{ flex: 1, border: '1px solid #cbd5e1' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
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
                            const file = e.target.files[0];
                            if (file) {
                              openImageCropper(file, (croppedFile) => {
                                setNewsImageFile(croppedFile);
                              });
                            }
                            document.getElementById('img_upload_radio').checked = true;
                          }}
                        />
                        {newsImageFile && (
                          <div style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 'bold' }}>✓ Image adjusted & ready</span>
                            <button type="button" className="admin-btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', margin: 0 }} onClick={() => openImageCropper(newsImageFile, (file) => setNewsImageFile(file))}>
                              Re-Adjust
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button className="admin-btn" type="submit" style={{ marginTop: '10px' }}>
                      Publish News 🚀
                    </button>
                  </form>
                </>
              )}
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
              <div className="admin-table-wrapper">
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
                        <td style={{ fontWeight: 600 }}>{art.title}</td>
                        <td><span className="badge-admin-cat">{art.category}</span></td>
                        <td>{new Date(art.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="admin-btn" 
                            onClick={() => {
                              setEditingArticle(art);
                              setEditNewsTitle(art.title);
                              setEditNewsContent(art.content);
                              setEditNewsCategory(art.category);
                              setEditNewsAuthor(art.author || '');
                              setEditNewsImageSource('keep');
                              setEditNewsImageFile(null);
                              setEditNewsMsg({ text: '', type: '' });
                              // scroll form into view
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            style={{ padding: '4px 8px', fontSize: '11.5px', marginRight: '8px', background: '#2563eb', color: '#fff', width: 'auto', display: 'inline-block' }}
                          >
                            Edit
                          </button>
                          <button className="admin-btn-danger" onClick={() => handleDeleteArticle(art.id)} style={{ padding: '4px 8px', fontSize: '11.5px', width: 'auto', display: 'inline-block' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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
            <div className="admin-table-wrapper">
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
                      <td>{item.message}</td>
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
        </div>
        )}

        {/* 3. TRENDING REELS TAB */}
        {activeTab === 'videos' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Add Trending Reel</h2>
              <form onSubmit={handleAddVideo}>
                {videoMsg.text && (
                  <div className={videoMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {videoMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Reel Title / Caption (ರೀಲ್ ಶೀರ್ಷಿಕೆ)</label>
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
                    <label>Duration (Optional)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={videoDuration} 
                      onChange={(e) => setVideoDuration(e.target.value)} 
                      placeholder="E.g., 5:42"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Reel Link / URL (YouTube, FB, Insta, etc.)</label>
                    <input 
                      className="admin-input" 
                      type="text" 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label>Thumbnail Image</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="radio" 
                        name="video_source" 
                        defaultChecked 
                        onChange={() => setVideoImageFile(null)} 
                      />
                      Use Placeholder (Gradient)
                    </label>
                    <select 
                      className="admin-input" 
                      value={videoImagePlaceholder} 
                      onChange={(e) => setVideoImagePlaceholder(e.target.value)}
                      disabled={videoImageFile !== null}
                    >
                      <option value="ph ph-red">Red Gradient</option>
                      <option value="ph ph-blue">Blue Gradient</option>
                      <option value="ph ph-orange">Orange Gradient</option>
                      <option value="ph ph-purple">Purple Gradient</option>
                      <option value="ph ph-teal">Teal Gradient</option>
                    </select>
                    
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <input 
                        type="radio" 
                        name="video_source" 
                        id="video_upload_radio" 
                      />
                      Upload Custom Thumbnail
                    </label>
                    <input 
                      type="file" 
                      className="admin-input" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          openImageCropper(file, (croppedFile) => {
                            setVideoImageFile(croppedFile);
                          });
                        }
                        document.getElementById('video_upload_radio').checked = true;
                      }}
                    />
                    {videoImageFile && (
                      <div style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 'bold' }}>✓ Image adjusted & ready</span>
                        <button type="button" className="admin-btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', margin: 0 }} onClick={() => openImageCropper(videoImageFile, (file) => setVideoImageFile(file))}>
                          Re-Adjust
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="admin-btn" type="submit">Add Reel 📹</button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Reels List</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title & Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td>
                        {v.image_url && v.image_url.startsWith('ph ph-') ? (
                          <div className={v.image_url} style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
                        ) : (
                          <img src={v.image_url} alt="thumbnail" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#222' }} />
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{v.title}</div>
                        <a href={v.video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'underline' }}>{v.video_url}</a>
                      </td>
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
                  <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Q: {activePoll.question}</h3>
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
            <div className="admin-table-wrapper">
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
              </div>
            )}
          </div>
        )}


        {/* 7. PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="admin-grid-layout">
            <div className="admin-card">
              <h2>Add Photo to Gallery</h2>
              <form onSubmit={handleAddPhoto}>
                {photoMsg.text && (
                  <div className={photoMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {photoMsg.text}
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Photo Caption (ಫೋಟೋ ಶೀರ್ಷಿಕೆ)</label>
                  <input 
                    className="admin-input" 
                    type="text" 
                    value={photoCaption} 
                    onChange={(e) => setPhotoCaption(e.target.value)} 
                    placeholder="E.g., ಮೈಸೂರು ದಸರಾ"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Image Source</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="radio" 
                        name="photo_source" 
                        defaultChecked 
                        onChange={() => setPhotoImageFile(null)} 
                      />
                      Use Placeholder (Gradient)
                    </label>
                    <select 
                      className="admin-input" 
                      value={photoImagePlaceholder} 
                      onChange={(e) => setPhotoImagePlaceholder(e.target.value)}
                      disabled={photoImageFile !== null}
                    >
                      <option value="ph ph-red">Red Gradient</option>
                      <option value="ph ph-blue">Blue Gradient</option>
                      <option value="ph ph-green">Green Gradient</option>
                      <option value="ph ph-orange">Orange Gradient</option>
                      <option value="ph ph-purple">Purple Gradient</option>
                      <option value="ph ph-teal">Teal Gradient</option>
                    </select>
                    
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <input 
                        type="radio" 
                        name="photo_source" 
                        id="photo_upload_radio" 
                      />
                      Upload Custom Photo
                    </label>
                    <input 
                      type="file" 
                      className="admin-input" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          openImageCropper(file, (croppedFile) => {
                            setPhotoImageFile(croppedFile);
                          });
                        }
                        document.getElementById('photo_upload_radio').checked = true;
                      }}
                    />
                    {photoImageFile && (
                      <div style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>✓ Photo adjusted & ready</span>
                        <button type="button" className="admin-btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', margin: 0 }} onClick={() => openImageCropper(photoImageFile, (file) => setPhotoImageFile(file))}>
                          Re-Adjust
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button className="admin-btn" type="submit">Add Photo 📷</button>
              </form>
            </div>

            <div className="admin-card">
              <h2>Gallery Photos</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Caption</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.image_url.startsWith('ph ph-') ? (
                          <div className={p.image_url} style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
                        ) : (
                          <img src={p.image_url} alt="thumbnail" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#222' }} />
                        )}
                      </td>
                      <td>{p.caption}</td>
                      <td>
                        <button className="admin-btn-danger" onClick={() => handleDeletePhoto(p.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {/* Image Cropper Modal */}
        <ImageAdjusterModal 
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          filename={cropperFilename}
          onClose={() => setCropperOpen(false)}
          onApply={(croppedFile) => {
            if (cropperCallback) cropperCallback(croppedFile);
            setCropperOpen(false);
          }}
        />      </main>
    </div>
  );
}

// 🎨 Image Adjuster / Cropper component
function ImageAdjusterModal({ imageSrc, filename, isOpen, onClose, onApply }) {
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  
  const canvasRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const touchStartDistRef = React.useRef(0);
  const touchStartZoomRef = React.useRef(1.0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 });

  const ratios = {
    '16:9': { width: 640, height: 360, label: 'Standard News Card (16:9)' },
    '4:3': { width: 640, height: 480, label: 'List Thumbnail (4:3)' },
    '9:16': { width: 360, height: 640, label: 'Reel/Video (9:16)' },
    '1:1': { width: 500, height: 500, label: 'Square/Profile (1:1)' },
    'original': { width: 640, height: 640, label: 'Freeform / Original' }
  };

  const currentConfig = ratios[selectedRatio] || ratios['16:9'];

  // Reset zoom and ratio when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
      setSelectedRatio('16:9');
    }
  }, [isOpen]);

  // Recalculate render size when image or ratio changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        
        let canvasW = currentConfig.width;
        let canvasH = currentConfig.height;
        
        if (selectedRatio === 'original') {
           const ratio = img.width / img.height;
           if (ratio > 1) {
              canvasW = 640;
              canvasH = 640 / ratio;
           } else {
              canvasH = 640;
              canvasW = 640 * ratio;
           }
        }
        
        const canvasRatio = canvasW / canvasH;
        const imgRatio = img.width / img.height;
        let w, h;
        if (imgRatio > canvasRatio) {
          h = canvasH;
          w = canvasH * imgRatio;
        } else {
          w = canvasW;
          h = canvasW / imgRatio;
        }
        setRenderSize({ width: w, height: h });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc, selectedRatio, currentConfig.width, currentConfig.height]);

  // Redraw canvas on zoom, rotation, offset, or image load change
  useEffect(() => {
    if (!isOpen || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Clear canvas
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Centered transformation
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    
    // Draw image centered
    ctx.drawImage(img, -renderSize.width / 2, -renderSize.height / 2, renderSize.width, renderSize.height);
    ctx.restore();

    // Draw grid overlay for crop frame visual help
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    // Thirds lines
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.moveTo((canvas.width * 2) / 3, 0);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height);
    ctx.moveTo(0, canvas.height / 3);
    ctx.lineTo(canvas.width, canvas.height / 3);
    ctx.moveTo(0, (canvas.height * 2) / 3);
    ctx.lineTo(canvas.width, (canvas.height * 2) / 3);
    ctx.stroke();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [isOpen, zoom, rotation, offsetX, offsetY, renderSize, currentConfig]);

  // Dragging event handlers (Mouse)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers (Mobile)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setOffsetX(touch.clientX - dragStart.x);
      setOffsetY(touch.clientY - dragStart.y);
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchStartDistRef.current > 0) {
        const ratio = dist / touchStartDistRef.current;
        const newZoom = Math.min(Math.max(touchStartZoomRef.current * ratio, 0.1), 4.0);
        setZoom(newZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = 0;
  };

  // Scroll wheel to zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomStep = 0.05;
    const factor = e.deltaY < 0 ? 1 : -1;
    const newZoom = Math.min(Math.max(zoom + factor * zoomStep, 0.1), 4.0);
    setZoom(newZoom);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    
    // Redraw the canvas without the grid overlay
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(imgRef.current, -renderSize.width / 2, -renderSize.height / 2, renderSize.width, renderSize.height);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], filename || 'cropped.jpg', { type: 'image/jpeg' });
      onApply(file);
    }, 'image/jpeg', 0.9);
  };

  if (!isOpen) return null;

  // Let's calculate the canvas width/height to pass to the canvas element
  let canvasW = currentConfig.width;
  let canvasH = currentConfig.height;
  if (selectedRatio === 'original' && imgRef.current) {
    const ratio = imgRef.current.width / imgRef.current.height;
    if (ratio > 1) {
       canvasW = 640;
       canvasH = 640 / ratio;
    } else {
       canvasH = 640;
       canvasW = 640 * ratio;
    }
  }

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-modal" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="cropper-modal-header">
          <h3>Crop & Adjust Image</h3>
          <button className="cropper-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div style={{ padding: '15px 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Card Type / Aspect Ratio:</label>
          <select 
            value={selectedRatio} 
            onChange={(e) => setSelectedRatio(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff', fontSize: '14px' }}
          >
            {Object.entries(ratios).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div 
          className="cropper-canvas-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '380px', padding: '20px' }}
        >
          <canvas 
            ref={canvasRef} 
            width={canvasW} 
            height={canvasH} 
            className="cropper-canvas"
            style={{ maxWidth: '100%', height: 'auto', maxHeight: '50vh', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
        </div>

        <div className="cropper-controls">
          <div className="cropper-control-row">
            <label>Zoom Slider:</label>
            <input 
              type="range" 
              min="0.1" 
              max="4.0" 
              step="0.05"
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))} 
            />
            <span style={{ minWidth: '40px', textAlign: 'right' }}>{zoom.toFixed(2)}x</span>
          </div>

          <div className="cropper-control-row">
            <label>Fine Rotation:</label>
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="1"
              value={rotation} 
              onChange={(e) => setRotation(parseInt(e.target.value))} 
            />
            <span style={{ minWidth: '40px', textAlign: 'right' }}>{rotation}°</span>
          </div>

          <div className="cropper-btn-group">
            <button type="button" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>Rotate ↺ 90°</button>
            <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)}>Rotate ↻ 90°</button>
            <button type="button" onClick={() => {
              setZoom(1.0);
              setRotation(0);
              setOffsetX(0);
              setOffsetY(0);
            }}>Reset All ↺</button>
            <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginLeft: 'auto' }}>
              💡 Hint: Drag to position, scroll wheel to zoom
            </span>
          </div>
        </div>

        <div className="cropper-actions">
          <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="apply" onClick={handleSave}>Apply Crop & Save</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
