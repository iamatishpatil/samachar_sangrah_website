const bcrypt = require('bcryptjs');
const db = require('./db.cjs');

setTimeout(() => {
  db.get("SELECT password_hash FROM users WHERE username = '9741453288'", [], async (err, user) => {
    if (err) console.error(err);
    if (user) {
      console.log('Hash in DB:', user.password_hash);
      const match = await bcrypt.compare('Avk2020', user.password_hash);
      console.log('Match Avk2020:', match);
      
      const res = await fetch('http://localhost:5173/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '9741453288', password: 'Avk2020' })
      });
      console.log('Login API response:', res.status, await res.text());
    } else {
      console.log('User not found');
    }
    process.exit(0);
  });
}, 1000);
