const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db.cjs');
const authenticateToken = require('../middleware/auth.cjs');
const { upload } = require('../middleware/upload.cjs');
const bcrypt = require('bcryptjs');

// Helper to get image url from multer file (supports Cloudinary and local)
const getImageUrl = (file) => {
  if (!file) return null;
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  return '/uploads/' + file.filename;
};

// Post news article
router.post('/news', authenticateToken, upload.single('image'), (req, res) => {
  const { title, content, category, author } = req.body;
  let image_url = req.body.image_url || 'ph ph-red'; // fallback or placeholder text

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }

  // If a file was uploaded, set image_url to the relative file path or cloud url
  if (req.file) {
    image_url = getImageUrl(req.file);
  }

  const finalAuthor = author || 'ಸಂಪಾದಕರು';

  db.run(
    'INSERT INTO articles (title, content, category, image_url, author) VALUES (?, ?, ?, ?, ?)',
    [title, content, category, image_url, finalAuthor],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        article: {
          id: this.lastID,
          title,
          content,
          category,
          image_url,
          author: finalAuthor,
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Delete news article
router.delete('/news/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Retrieve article details to check if there is an uploaded image to delete
  db.get('SELECT image_url FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Article not found' });

    // Check if the image is an uploaded file, not a CSS gradient placeholder class
    if (row.image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', row.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    db.run('DELETE FROM articles WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: deleteErr.message });
      }
      res.json({ success: true, message: 'Article deleted successfully' });
    });
  });
});

// Create/Update Ticker tape message
router.post('/ticker', authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Ticker message is required' });
  }

  db.run('INSERT INTO ticker (message, is_active) VALUES (?, 1)', [message], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, item: { id: this.lastID, message, is_active: 1 } });
  });
});

// Delete Ticker tape message
router.delete('/ticker/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM ticker WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Post video/reel card
router.post('/videos', authenticateToken, upload.single('image'), (req, res) => {
  const { title, duration, video_url } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const finalVideoUrl = video_url || '#';
  let finalImageUrl = req.body.image_url || 'ph ph-red';
  if (req.file) {
    finalImageUrl = getImageUrl(req.file);
  }

  db.run(
    'INSERT INTO videos (title, duration, video_url, image_url) VALUES (?, ?, ?, ?)',
    [title, duration || '', finalVideoUrl, finalImageUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        video: { id: this.lastID, title, duration: duration || '', video_url: finalVideoUrl, image_url: finalImageUrl }
      });
    }
  );
});

// Delete video card
router.delete('/videos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM videos WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Post opinion card
router.post('/opinions', authenticateToken, (req, res) => {
  const { author_name, author_role, author_avatar, headline, quote } = req.body;
  if (!author_name || !headline || !quote) {
    return res.status(400).json({ error: 'Author name, headline, and quote text are required' });
  }

  const avatar = author_avatar || '👨';
  const role = author_role || 'ಅಂಕಣಕಾರರು';

  db.run(
    'INSERT INTO opinions (author_name, author_role, author_avatar, headline, quote) VALUES (?, ?, ?, ?, ?)',
    [author_name, role, avatar, headline, quote],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        opinion: { id: this.lastID, author_name, author_role: role, author_avatar: avatar, headline, quote }
      });
    }
  );
});

// Delete opinion card
router.delete('/opinions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM opinions WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Set up new active poll
router.post('/poll', authenticateToken, (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Question and at least 2 options are required' });
  }

  db.run('UPDATE polls SET is_active = 0', [], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const initialVotes = {};
    options.forEach(opt => {
      initialVotes[opt] = 0;
    });

    const optionsJson = JSON.stringify(options);
    const votesJson = JSON.stringify(initialVotes);

    db.run(
      'INSERT INTO polls (question, options_json, votes_json, is_active) VALUES (?, ?, ?, 1)',
      [question, optionsJson, votesJson],
      function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }
        res.json({
          success: true,
          poll: { id: this.lastID, question, options, votes: initialVotes }
        });
      }
    );
  });
});

// Retrieve newsletter subscribers list
router.get('/subscribers', authenticateToken, (req, res) => {
  db.all('SELECT * FROM subscribers ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Download full database backup
router.get('/backup', authenticateToken, (req, res) => {
  const backup = {};
  
  db.all('SELECT * FROM articles ORDER BY id DESC', [], (err1, articles) => {
    if (err1) return res.status(500).json({ error: err1.message });
    backup.articles = articles;
    
    db.all('SELECT * FROM ticker ORDER BY id DESC', [], (err2, ticker) => {
      if (err2) return res.status(500).json({ error: err2.message });
      backup.ticker = ticker;
      
      db.all('SELECT * FROM videos ORDER BY id DESC', [], (err3, videos) => {
        if (err3) return res.status(500).json({ error: err3.message });
        backup.videos = videos;
        
        db.all('SELECT * FROM opinions ORDER BY id DESC', [], (err4, opinions) => {
          if (err4) return res.status(500).json({ error: err4.message });
          backup.opinions = opinions;
          
          db.all('SELECT * FROM polls ORDER BY id DESC', [], (err5, polls) => {
            if (err5) return res.status(500).json({ error: err5.message });
            backup.polls = polls.map(p => ({
              ...p,
              options: JSON.parse(p.options_json),
              votes: JSON.parse(p.votes_json)
            }));
            
            db.all('SELECT * FROM subscribers ORDER BY id DESC', [], (err6, subscribers) => {
              if (err6) return res.status(500).json({ error: err6.message });
              backup.subscribers = subscribers;
              
              // Return file directly with attachment header
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Content-Disposition', `attachment; filename=samachar_sangarah_backup_${new Date().toISOString().split('T')[0]}.json`);
              res.send(JSON.stringify(backup, null, 2));
            });
          });
        });
      });
    });
  });
});

// Post photo to gallery
router.post('/photos', authenticateToken, upload.single('image'), (req, res) => {
  const { caption } = req.body;
  let image_url = req.body.image_url || 'ph ph-red'; 
  if (req.file) {
    image_url = getImageUrl(req.file);
  }

  db.run(
    'INSERT INTO photos (image_url, caption) VALUES (?, ?)',
    [image_url, caption || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        photo: {
          id: this.lastID,
          image_url,
          caption: caption || '',
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Delete photo from gallery
router.delete('/photos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT image_url FROM photos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Photo not found' });

    if (row.image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', row.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    db.run('DELETE FROM photos WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: deleteErr.message });
      }
      res.json({ success: true, message: 'Photo deleted successfully' });
    });
  });
});

// Update news article
router.put('/news/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, content, category, author } = req.body;
  let image_url = req.body.image_url;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }

  const finalAuthor = author || 'ಸಂಪಾದಕರು';

  const performUpdate = (finalImageUrl) => {
    const sql = finalImageUrl 
      ? 'UPDATE articles SET title = ?, content = ?, category = ?, image_url = ?, author = ? WHERE id = ?'
      : 'UPDATE articles SET title = ?, content = ?, category = ?, author = ? WHERE id = ?';
    
    const params = finalImageUrl
      ? [title, content, category, finalImageUrl, finalAuthor, id]
      : [title, content, category, finalAuthor, id];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: 'Article updated successfully',
        article: {
          id: parseInt(id),
          title,
          content,
          category,
          image_url: finalImageUrl || undefined,
          author: finalAuthor
        }
      });
    });
  };

  const newFileUploaded = !!req.file;
  const switchedToPlaceholder = image_url && image_url.startsWith('ph ph-');

  if (newFileUploaded || switchedToPlaceholder) {
    db.get('SELECT image_url FROM articles WHERE id = ?', [id], (err, row) => {
      if (!err && row && row.image_url && row.image_url.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '../public', row.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      const nextImageUrl = newFileUploaded ? getImageUrl(req.file) : image_url;
      performUpdate(nextImageUrl);
    });
  } else {
    performUpdate(image_url);
  }
});

// Get real-time database analytics
router.get('/analytics', authenticateToken, (req, res) => {
  db.get('SELECT COUNT(*) as count FROM articles', [], (err1, rArticles) => {
    if (err1) return res.status(500).json({ error: err1.message });
    
    db.get('SELECT COUNT(DISTINCT category) as count FROM articles', [], (err2, rCategories) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      db.get('SELECT COUNT(*) as count FROM subscribers', [], (err3, rSubscribers) => {
        if (err3) return res.status(500).json({ error: err3.message });
        
        db.get('SELECT SUM(COALESCE(views, 0)) as total FROM articles', [], (err4, rArticleViews) => {
          if (err4) return res.status(500).json({ error: err4.message });
          
          db.get('SELECT SUM(COALESCE(views, 0)) as total FROM photos', [], (err5, rPhotoViews) => {
            if (err5) return res.status(500).json({ error: err5.message });
            
            const totalArticleViews = parseInt(rArticleViews.total) || 0;
            const totalPhotoViews = parseInt(rPhotoViews.total) || 0;
            
            res.json({
              totalArticles: parseInt(rArticles.count) || 0,
              totalCategories: parseInt(rCategories.count) || 0,
              totalSubscribers: parseInt(rSubscribers.count) || 0,
              totalViews: totalArticleViews + totalPhotoViews,
              storyViews: totalPhotoViews,
              articleViews: totalArticleViews
            });
          });
        });
      });
    });
  });
});

// Create new collaborative admin
router.post('/collaborators', authenticateToken, async (req, res) => {
  const { mobileNumber, password } = req.body;
  if (!mobileNumber || !password) {
    return res.status(400).json({ error: 'Mobile number and password are required' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [mobileNumber, hash], function(err) {
      if (err) {
        if (err.message && err.message.includes('unique constraint')) {
          return res.status(400).json({ error: 'An admin with this mobile number already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Collaborator added successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
