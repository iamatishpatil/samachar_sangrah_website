const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

// Get active news list
router.get('/news', (req, res) => {
  const category = req.query.category;
  let query = 'SELECT * FROM articles';
  let params = [];

  if (category && category !== 'ಮುಖಪುಟ') {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC LIMIT 60';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single article by ID
router.get('/news/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Article not found' });
    res.json(row);
  });
});

// Get active ticker tape items
router.get('/ticker', (req, res) => {
  db.all('SELECT * FROM ticker WHERE is_active = 1 ORDER BY id DESC LIMIT 15', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get video items
router.get('/videos', (req, res) => {
  db.all('SELECT * FROM videos ORDER BY id DESC LIMIT 24', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get opinions list
router.get('/opinions', (req, res) => {
  db.all('SELECT * FROM opinions ORDER BY id DESC LIMIT 15', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get currently active poll
router.get('/poll', (req, res) => {
  db.get('SELECT * FROM polls WHERE is_active = 1 ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.json(null);
    }
    res.json({
      id: row.id,
      question: row.question,
      options: JSON.parse(row.options_json),
      votes: JSON.parse(row.votes_json)
    });
  });
});

// Submit a vote to the active poll
router.post('/poll/vote', (req, res) => {
  const { pollId, option } = req.body;
  if (!pollId || !option) {
    return res.status(400).json({ error: 'Poll ID and option selection are required' });
  }

  db.get('SELECT * FROM polls WHERE id = ?', [pollId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const votes = JSON.parse(row.votes_json);
    if (votes[option] !== undefined) {
      votes[option] = (votes[option] || 0) + 1;
    } else {
      votes[option] = 1;
    }

    const updatedVotesJson = JSON.stringify(votes);
    db.run('UPDATE polls SET votes_json = ? WHERE id = ?', [updatedVotesJson, pollId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }
      res.json({
        id: pollId,
        question: row.question,
        options: JSON.parse(row.options_json),
        votes: votes
      });
    });
  });
});

// Submit a newsletter subscriber
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  db.run('INSERT INTO subscribers (email) VALUES (?)', [email], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'This email is already subscribed!' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Subscribed successfully!' });
  });
});

// Get photos for gallery
router.get('/photos', (req, res) => {
  db.all('SELECT * FROM photos ORDER BY id DESC LIMIT 12', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
