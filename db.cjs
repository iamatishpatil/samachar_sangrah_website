const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool(
  connectionString 
    ? { connectionString } 
    : {
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '12345',
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE || 'samachar_sangarah'
      }
);

// Connection will be verified after database migrations run

// Helper to convert SQLite query placeholders (?) to PostgreSQL ($1, $2...)
function convertSql(sql) {
  let count = 1;
  let converted = sql.replace(/\?/g, () => `$${count++}`);
  
  // Auto-append RETURNING id for INSERT queries to support this.lastID context
  const trimmed = converted.trim().toUpperCase();
  if (trimmed.startsWith('INSERT') && !trimmed.includes('RETURNING')) {
    converted += ' RETURNING id';
  }
  return converted;
}

// Database wrapper mimicking SQLite API
const db = {
  // Execute query matching sqlite3.all()
  all: (sql, params, callback) => {
    const pgSql = convertSql(sql);
    pool.query(pgSql, params)
      .then(res => {
        if (typeof callback === 'function') callback(null, res.rows);
      })
      .catch(err => {
        console.error('DB All Error:', err.message, 'SQL:', pgSql);
        if (typeof callback === 'function') callback(err);
      });
  },

  // Execute query matching sqlite3.get()
  get: (sql, params, callback) => {
    const pgSql = convertSql(sql);
    pool.query(pgSql, params)
      .then(res => {
        if (typeof callback === 'function') callback(null, res.rows[0] || null);
      })
      .catch(err => {
        console.error('DB Get Error:', err.message, 'SQL:', pgSql);
        if (typeof callback === 'function') callback(err);
      });
  },

  // Execute query matching sqlite3.run()
  run: function(sql, params, callback) {
    const pgSql = convertSql(sql);
    pool.query(pgSql, params)
      .then(res => {
        // Mock the SQLite statement context
        const context = {
          lastID: res.rows[0] ? res.rows[0].id : null,
          changes: res.rowCount
        };
        if (typeof callback === 'function') {
          callback.call(context, null);
        }
      })
      .catch(err => {
        console.error('DB Run Error:', err.message, 'SQL:', pgSql);
        if (typeof callback === 'function') callback(err);
      });
  }
};

// ════════════════════════════ POSTGRES DATABASE MIGRATIONS ════════════════════════════
const initializeDatabase = async () => {
  try {
    // 0. Ensure target database exists
    const dbName = process.env.PGDATABASE || 'samachar_sangarah';
    const tempClient = new (require('pg').Client)({
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '12345',
      port: parseInt(process.env.PGPORT || '5432'),
      database: 'postgres'
    });
    try {
      await tempClient.connect();
      const dbCheck = await tempClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
      if (dbCheck.rowCount === 0) {
        await tempClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database "${dbName}" created successfully.`);
      }
    } catch (dbErr) {
      console.warn('⚠️ Database existence check warning:', dbErr.message);
    } finally {
      await tempClient.end();
    }

    // 1. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password_hash TEXT
      )
    `);

    // Create default admin user
    const adminUsername = '9741453288';
    const adminPassword = 'Avk2020';
    
    // Delete legacy default admin user
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    const userCheck = await pool.query("SELECT id FROM users WHERE username = $1", [adminUsername]);
    if (userCheck.rowCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPassword, salt);
      await pool.query("INSERT INTO users (username, password_hash) VALUES ($1, $2)", [adminUsername, hash]);
      console.log(`Default admin account created: username '${adminUsername}'`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPassword, salt);
      await pool.query("UPDATE users SET password_hash = $1 WHERE username = $2", [hash, adminUsername]);
    }

    // 2. Create Articles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        category VARCHAR(100),
        image_url TEXT,
        author VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add views column if it doesn't exist
    await pool.query(`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
    `);

    // Add extra images columns
    await pool.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url_2 TEXT;`);
    await pool.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url_3 TEXT;`);
    await pool.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url_4 TEXT;`);

    // Seed default articles if empty
    const articleCheck = await pool.query("SELECT count(*) as count FROM articles");
    if (parseInt(articleCheck.rows[0].count) === 0) {
      const defaultArticles = [
        {
          title: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ ರೈತರಿಗೆ ₹5,000 ಕೋಟಿ ಪರಿಹಾರ ಘೋಷಣೆ — ಹಿಂಗಾರು ಹಾನಿ ಪರಿಹಾರ ನೇರ ಖಾತೆಗೆ",
          content: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ ರೈತರಿಗೆ ₹5,000 ಕೋಟಿ ಪರಿಹಾರ ಘೋಷಣೆ ಮಾಡಿದೆ. ಹಿಂಗಾರು ಹಾನಿ ಪರಿಹಾರ ನೇರ ಖಾತೆಗೆ ವರ್ಗಾವಣೆ ಮಾಡಲಾಗುವುದು. ಇದರಿಂದ ಲಕ್ಷಾಂತರ ರೈತರಿಗೆ ಅನುಕೂಲವಾಗಲಿದೆ.",
          category: "ರಾಜ್ಯ",
          image_url: "ph ph-red",
          author: "ರಾಜೇಶ್ ಹೆಗ್ಡೆ"
        },
        {
          title: "ಪ್ರಧಾನಿ ಮೋದಿ ಹೊಸ ಶಿಕ್ಷಣ ನೀತಿ ಜಾರಿಗೆ ಸಮಗ್ರ ಯೋಜನೆ — ಡಿಜಿಟಲ್ ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ",
          content: "ಪ್ರಧಾನಿ ಮೋದಿ ಹೊಸ ಶಿಕ್ಷಣ ನೀತಿ ಜಾರಿಗೆ ಸಮಗ್ರ ಯೋಜನೆ ಘೋಷಿಸಿದ್ದಾರೆ. ಡಿಜಿಟಲ್ ಶಿಕ್ಷಣ ವ್ಯವಸ್ಥೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ವಿಶೇಷ ಒತ್ತು ನೀಡಲಾಗಿದೆ.",
          category: "ರಾಷ್ಟ್ರ",
          image_url: "ph ph-blue",
          author: "ವರದಿಗಾರ"
        },
        {
          title: "ಭಾರತ vs ನ್ಯೂಜಿಲ್ಯಾಂಡ್ ಟೆಸ್ಟ್ — ವಿರಾಟ್ ಕೊಹ್ಲಿ ಶತಕ ಹೊಡೆದರು, ಭಾರತ 320/4",
          content: "ಭಾರತ ಮತ್ತು ನ್ಯೂಜಿಲ್ಯಾಂಡ್ ನಡುವಿನ ಟೆಸ್ಟ್ ಪಂದ್ಯದಲ್ಲಿ ವಿರಾಟ್ ಕೊಹ್ಲಿ ಭರ್ಜರಿ ಶತಕ ಹೊಡೆದಿದ್ದಾರೆ. ಭಾರತ ಮೊದಲ ಇನ್ನಿಂಗ್ಸ್‌ನಲ್ಲಿ ಬಲಿಷ್ಠ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.",
          category: "ಕ್ರೀಡೆ",
          image_url: "ph ph-orange",
          author: "ಕ್ರೀಡಾ ವರದಿಗಾರ"
        },
        {
          title: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಸಂಚಾರ ದಟ್ಟಣೆ ಕಡಿಮೆ ಮಾಡಲು ₹800 ಕೋಟಿ ರಸ್ತೆ ಯೋಜನೆ ಅನುಮೋದನೆ",
          content: "ಸಿಲಿಕಾನ್ ಸಿಟಿಯ ಸಂಚಾರ ದಟ್ಟಣೆ ಸಮಸ್ಯೆಗೆ ಪರಿಹಾರವಾಗಿ ಸರ್ಕಾರ ₹800 ಕೋಟಿ ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗೆ ಹಸಿರು ನಿಶಾನೆ ತೋರಿಸಿದೆ.",
          category: "ಬೆಂಗಳೂರು",
          image_url: "ph ph-red",
          author: "ನಗರ್ ವರದಿಗಾರ"
        },
        {
          title: "ಮೈಸೂರು ನಗರ ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಯೋಜನೆ ಪ್ರಗತಿ — 15 ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಕೆಲಸ ಪೂರ್ಣ",
          content: "ಮೈಸೂರು ನಗರದ ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಕಾಮಗಾರಿಗಳು ವೇಗವಾಗಿ ಪ್ರಗತಿ ಹೊಂದುತ್ತಿದ್ದು, ಪ್ರಮುಖ 15 ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಕೆಲಸ ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.",
          category: "ಮೈಸೂರು",
          image_url: "ph ph-green",
          author: "ಮೈಸೂರು ವರದಿಗಾರ"
        },
        {
          title: "ಧಾರವಾಡ-ಹುಬ್ಬಳ್ಳಿ ಟ್ವಿನ್ ಸಿಟಿ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆ — ₹1,200 ಕೋಟಿ ಮಂಜೂರು",
          content: "ಉತ್ತರ ಕರ್ನಾಟಕದ ಅವಳಿ ನಗರಗಳ ಅಭಿವೃದ್ಧಿಗಾಗಿ ಸರ್ಕಾರ ₹1,200 ಕೋಟಿ ಅನುದಾನ ಮಂಜೂರು ಮಾಡಿದೆ.",
          category: "ಹುಬ್ಬಳ್ಳಿ",
          image_url: "ph ph-blue",
          author: "ಹುಬ್ಬಳ್ಳಿ ವರದಿಗಾರ"
        },
        {
          title: "ಕಲ್ಯಾಣ ಕರ್ನಾಟಕ ಅಭಿವೃದ್ಧಿ ಮಂಡಳಿ — ₹3,000 ಕೋಟಿ ಹೊಸ ಯೋಜನೆ ಪ್ರಕಟ",
          content: "ಕಲ್ಯಾಣ ಕರ್ನಾಟಕ ಭಾಗದ ಸಮಗ್ರ ಅಭಿವೃದ್ಧಿಗಾಗಿ ಮಂಡಳಿಯು ₹3,000 ಕೋಟಿ ಮೊತ್ತದ ನೂತನ ಯೋಜನೆಗಳನ್ನು ಪ್ರಕಟಿಸಿದೆ.",
          category: "ರಾಜ್ಯ",
          image_url: "ph ph-purple",
          author: "ರಾಜ್ಯ ವರದಿಗಾರ"
        },
        {
          title: "ಕರ್ನಾಟಕ ಸಿಐಡಿ ₹200 ಕೋಟಿ ಹಗರಣ ಬಯಲು — 5 ಅಧಿಕಾರಿಗಳ ಬಂಧನ",
          content: "ಬೃಹತ್ ಹಣಕಾಸು ಹಗರಣವನ್ನು ಬಯಲಿಗೆಳೆದ ಕರ್ನಾಟಕ ಸಿಐಡಿ ಪೊಲೀಸರು, ಪ್ರಮುಖ 5 ಅಧಿಕಾರಿಗಳನ್ನು ಬಂಧಿಸಿ ವಿಚಾರಣೆ ನಡೆಸುತ್ತಿದ್ದಾರೆ.",
          category: "ರಾಜ್ಯ",
          image_url: "ph ph-teal",
          author: "ಕ್ರೈಮ್ ಡೆಸ್ಕ್"
        },
        {
          title: "ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯಲ್ಲಿ ಕಾಡಾನೆ ದಾಳಿ — ಹೊಲ ಹಾನಿ, ರೈತರ ಆತಂಕ",
          content: "ಶಿವಮೊಗ್ಗ ಗಡಿ ಗ್ರಾಮಗಳಲ್ಲಿ ಕಾಡಾನೆಗಳ ಹಾವಳಿ ಹೆಚ್ಚಾಗಿದ್ದು, ವ್ಯಾಪಕ ಬೆಳೆ ಹಾನಿಯಾಗಿದೆ. ಸ್ಥಳೀಯ ರೈತರು ಆತಂಕದಲ್ಲಿದ್ದಾರೆ.",
          category: "ರಾಜ್ಯ",
          image_url: "ph ph-orange",
          author: "ಶಿವಮೊಗ್ಗ ವರದಿಗಾರ"
        },
        {
          title: "ಲೋಕಸಭೆ ಅಧಿವೇಶನ — ವಿರೋಧ ಪಕ್ಷ ಪ್ರಸ್ತಾಪ ತಂದ ಅವಿಶ್ವಾಸ ನಿರ್ಣಯ ಬಿದ್ದು ಹೋಯಿತು",
          content: "ಲೋಕಸಭೆಯಲ್ಲಿ ಆಡಳಿತ ಪಕ್ಷದ ವಿರುದ್ಧ ವಿರೋಧ ಪಕ್ಷಗಳು ತಂದಿದ್ದ ಅವಿಶ್ವಾಸ ನಿರ್ಣಯವು ಭಾರಿ ಚರ್ಚೆಯ ಬಳಿಕ ಮತಕ್ಕೆ ಹಾಕಿ ಬಿದ್ದು ಹೋಯಿತು.",
          category: "ರಾಷ್ಟ್ರ",
          image_url: "ph ph-navy",
          author: "ದಿಲ್ಲಿ ಪ್ರತಿನಿಧಿ"
        },
        {
          title: "GST ಸಂಗ್ರಹ ₹1.96 ಲಕ್ಷ ಕೋಟಿ — ಸತತ 8ನೇ ತಿಂಗಳು ₹1.5 ಲಕ್ಷ ಮೀರಿತು",
          content: "ದೇಶದಲ್ಲಿ ಜಿಎಸ್‌ಟಿ ತೆರಿಗೆ ಸಂಗ್ರಹ ದಾಖಲೆ ಮಟ್ಟ ತಲುಪಿದ್ದು, ಈ ತಿಂಗಳು ₹1.96 ಲಕ್ಷ ಕೋಟಿ ಜಿಎಸ್‌ಟಿ ಸಂಗ್ರಹವಾಗಿದೆ.",
          category: "ರಾಷ್ಟ್ರ",
          image_url: "ph ph-teal",
          author: "ಹಣಕಾಸು ವರದಿಗಾರ"
        },
        {
          title: "ರಾಮಮಂದಿರ ಟ್ರಸ್ಟ್ — ₹500 ಕೋಟಿ ದೇಣಿಗೆ ಸ್ವೀಕಾರ",
          content: "ಅಯೋಧ್ಯೆಯ ರಾಮಮಂದಿರ ಟ್ರಸ್ಟ್‌ಗೆ ಭಕ್ತರಿಂದ ಭಾರಿ ಪ್ರಮಾಣದ ದೇಣಿಗೆ ಹರಿದುಬಂದಿದ್ದು, ಒಟ್ಟು ₹500 ಕೋಟಿ ಅಧಿಕ ದೇಣಿಗೆ ಸಂಗ್ರಹವಾಗಿದೆ.",
          category: "ರಾಷ್ಟ್ರ",
          image_url: "ph ph-orange",
          author: "ವರದಿಗಾರ"
        },
        {
          title: "ಭಾರತ-ಅಮೆರಿಕ ರಕ್ಷಣಾ ಒಪ್ಪಂದ — F-35 ಯುದ್ಧ ವಿಮಾನ ಖರೀದಿ ಚರ್ಚೆ",
          content: "ಭಾರತ ಮತ್ತು ಅಮೆರಿಕ ನಡುವೆ ರಕ್ಷಣಾ ವಲಯದಲ್ಲಿ ಹೊಸ ಒಪ್ಪಂದ ಏರ್ಪಟ್ಟಿದ್ದು, ಅತ್ಯಾಧುನಿಕ F-35 ಯುದ್ಧ ವಿಮಾನ ಖರೀದಿ ಬಗ್ಗೆ ಮಾತುಕತೆ ನಡೆದಿದೆ.",
          category: "ರಾಷ್ಟ್ರ",
          image_url: "ph ph-blue",
          author: "ವರದಿಗಾರ"
        },
        {
          title: "ಕಾಂಗ್ರೆಸ್-JDS ಮೈತ್ರಿ — 2028 ಚುನಾವಣೆಗೆ ಹೊಸ ತಂತ್ರ",
          content: "ಮುಂದಿನ 2028 ರ ವಿಧಾನಸಭೆ ಚುನಾವಣೆಗಾಗಿ ಕಾಂಗ್ರೆಸ್ ಮತ್ತು ಜೆಡಿಎಸ್ ಮೈತ್ರಿಯ ಬಗ್ಗೆ ರಾಜ್ಯ ರಾಜಕಾರಣದಲ್ಲಿ ಚರ್ಚೆ ಆರಂಭವಾಗಿದೆ.",
          category: "ರಾಜಕೀಯ",
          image_url: "ph ph-red",
          author: "ರಾಜಕೀಯ ವಿಶ್ಲೇಷಕ"
        },
        {
          title: "BJP ರಾಜ್ಯ ಅಧ್ಯಕ್ಷ ಸ್ಥಾನ — ವಿ.ಸೋಮಣ್ಣ ಹೆಸರು ಪ್ರಮುಖ",
          content: "ಬಿಜೆಪಿ ರಾಜ್ಯ ಘಟಕದ ಅಧ್ಯಕ್ಷ ಸ್ಥಾನದ ಆಯ್ಕೆ ಪ್ರಕ್ರಿಯೆ ಬಿರುಸಾಗಿದ್ದು, ಹಿರಿಯ ನಾಯಕ ವಿ.ಸೋಮಣ್ಣ ಅವರ ಹೆಸರು ಪ್ರಮುಖವಾಗಿ ಕೇಳಿ ಬರುತ್ತಿದೆ.",
          category: "ರಾಜಕೀಯ",
          image_url: "ph ph-orange",
          author: "ರಾಜಕೀಯ ವರದಿಗಾರ"
        },
        {
          title: "ಸಿದ್ದರಾಮಯ್ಯ ಸ್ಪಷ್ಟೀಕರಣ ತಿರಸ್ಕಾರ — ರಾಜ್ಯಪಾಲರ ಕಚೇರಿ ನಿಲುವು",
          content: "ವಿವಿಧ ವಿಷಯಗಳ ಕುರಿತು ಮುಖ್ಯಮಂತ್ರಿ ಸಿದ್ದರಾಮಯ್ಯ ನೀಡಿದ್ದ ಸ್ಪಷ್ಟೀಕರಣವನ್ನು ರಾಜ್ಯಪಾಲರು ತಿರಸ್ಕರಿಸಿದ್ದಾರೆ.",
          category: "ರಾಜಕೀಯ",
          image_url: "ph ph-dark",
          author: "ರಾಜ್ಯ ಬ್ಯೂರೋ"
        },
        {
          title: "ಉಪಮುಖ್ಯಮಂತ್ರಿ ಡಿ.ಕೆ.ಶಿವಕುಮಾರ್ — 5 ಜಿಲ್ಲೆ ಪ್ರವಾಸ ಕಾರ್ಯಕ್ರಮ",
          content: "ಉಪಮುಖ್ಯಮಂತ್ರಿ ಡಿ.ಕೆ.ಶಿವಕುಮಾರ್ ಅವರು ವಿವಿಧ ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿಗಳ ಪರಿಶೀಲನೆಗಾಗಿ 5 ಜಿಲ್ಲೆಗಳ ಪ್ರವಾಸ ಹಮ್ಮಿಕೊಂಡಿದ್ದಾರೆ.",
          category: "ರಾಜಕೀಯ",
          image_url: "ph ph-blue",
          author: "ವರದಿಗಾರ"
        },
        {
          title: "ಚುನಾವಣಾ ಆಯೋಗ — ಸ್ಥಳೀಯ ಚುನಾವಣೆ ತಾರೀಖು ಪ್ರಕಟ",
          content: "ರಾಜ್ಯದ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಗಳ ಚುನಾವಣೆಗೆ ಆಯೋಗವು ದಿನಾಂಕಗಳನ್ನು ಘೋಷಿಸಿದ್ದು, ಇಂದಿನಿಂದಲೇ ನೀತಿ ಸಂಹಿತೆ ಜಾರಿಗೆ ಬರಲಿದೆ.",
          category: "ರಾಜಕೀಯ",
          image_url: "ph ph-green",
          author: "ವರದಿಗಾರ"
        },
        {
          title: "RCB vs MI — ವಿರಾಟ್ ಕೊಹ್ಲಿ 82 ರನ್ ಬಾರಿಸಿ ತಂಡವನ್ನು ಗೆಲ್ಲಿಸಿದರು",
          content: "ಮುಂಬೈ ವಿರುದ್ಧದ ಐಪಿಎಲ್ ಪಂದ್ಯದಲ್ಲಿ ವಿರಾಟ್ ಕೊಹ್ಲಿ ಅಬ್ಬರದ 82 ರನ್ ಗಳಿಸಿ ರಾಯಲ್ ಚಾಲೆಂಜರ್ಸ್ ಬೆಂಗಳೂರು ತಂಡಕ್ಕೆ ಜಯ ತಂದುಕೊಟ್ಟರು.",
          category: "IPL 2025",
          image_url: "ph ph-orange",
          author: "ಕ್ರೀಡಾ ವರದಿಗಾರ"
        },
        {
          title: "ಫೆಡರರ್ ವಿರಾಮದ ನಂತರ ಟೆನ್ನಿಸ್ ಅಕಾಡೆಮಿ ತೆರೆದರು",
          content: "ವಿಶ್ವದ ಶ್ರೇಷ್ಠ ಟೆನ್ನಿಸ್ ಆಟಗಾರ ರೋಜರ್ ಫೆಡರರ್ ಅವರು ಹೊಸ ಕ್ರೀಡಾ ಅಕಾಡೆಮಿಯನ್ನು ಸ್ಥಾಪಿಸಿ ಯುವ ಪ್ರತಿಭೆಗಳಿಗೆ ತರಬೇತಿ ನೀಡಲಿದ್ದಾರೆ.",
          category: "ಕ್ರೀಡೆ",
          image_url: "ph ph-green",
          author: "ಕ್ರೀಡಾ ಪ್ರತಿನಿಧಿ"
        },
        {
          title: "ಬ್ಯಾಡ್ಮಿಂಟನ್ — ಪಿ.ವಿ.ಸಿಂಧು ಆಲ್ ಇಂಗ್ಲೆಂಡ್ ಫೈನಲ್‌ಗೆ ಪ್ರವೇಶ",
          content: "ಆಲ್ ಇಂಗ್ಲೆಂಡ್ ಬ್ಯಾಡ್ಮಿಂಟನ್ ಚಾಂಪಿಯನ್‌ಶಿಪ್ ಸೆಮಿಫೈನಲ್ ಪಂದ್ಯದಲ್ಲಿ ಪಿ.ವಿ.ಸಿಂಧು ಜಯಗಳಿಸಿ ಫೈನಲ್‌ಗೆ ಲಗ್ಗೆ ಇಟ್ಟಿದ್ದಾರೆ.",
          category: "ಕ್ರೀಡೆ",
          image_url: "ph ph-blue",
          author: "ಕ್ರೀಡಾ ವರದಿಗಾರ"
        },
        {
          title: "ಕನ್ನಡ ಚಿತ್ರ 'ಕಾಂತಾರ-2' ಚಿತ್ರೀಕರಣ ಪ್ರಾರಂಭ — ರಿಷಬ್ ಶೆಟ್ಟಿ ಖಚಿತ",
          content: "ಬಹುನಿರೀಕ್ಷಿತ 'ಕಾಂತಾರ-2' ಚಿತ್ರದ ಮುಹೂರ್ತ ಮುಗಿದಿದ್ದು, ಪೂರ್ಣಪ್ರಮಾಣದ ಚಿತ್ರೀಕರಣ ಇಂದಿನಿಂದ ಕರಾವಳಿ ಭಾಗದಲ್ಲಿ ಆರಂಭವಾಗಿದೆ.",
          category: "ಮನರಂಜನೆ",
          image_url: "ph ph-purple",
          author: "ಸಿನಿಮಾ ಡೆಸ್ಕ್"
        },
        {
          title: "ಸ್ಟಾರ್ ಸುವರ್ಣ ಹೊಸ ಧಾರಾವಾಹಿ 'ಅನುಬಂಧ' — ಮಾರ್ಚ್ 1 ರಿಂದ ಪ್ರಸಾರ",
          content: "ಕಿರುತೆರೆ ಪ್ರೇಕ್ಷಕರಿಗೆ ಹೊಸ ಮನರಂಜನೆ ನೀಡಲು ಸ್ಟಾರ್ ಸುವರ್ಣ ವಾಹಿನಿಯಲ್ಲಿ ಹೊಸ ಕೌಟುಂಬಿಕ ಧಾರಾವಾಹಿ 'ಅನುಬಂಧ' ಪ್ರಸಾರವಾಗಲಿದೆ.",
          category: "ಮನರಂಜನೆ",
          image_url: "ph ph-teal",
          author: "ಕಿರುತೆರೆ ಪ್ರತಿನಿಧಿ"
        },
        {
          title: "ಫಿಲ್ಮ್‌ಫೇರ್ ಅವಾರ್ಡ್ — ಕನ್ನಡ ನಟ ದರ್ಶನ್‌ಗೆ ಅತ್ಯುತ್ತಮ ನಟ ಪ್ರಶಸ್ತಿ",
          content: "ನಡೆಯುತ್ತಿರುವ ಫಿಲ್ಮ್‌ಫೇರ್ ಪ್ರಶಸ್ತಿ ಪ್ರದಾನ ಸಮಾರಂಭದಲ್ಲಿ ಕನ್ನಡದ ಖ್ಯಾತ ನಟ ದರ್ಶನ್ ಅವರಿಗೆ ಅತ್ಯುತ್ತಮ ನಟ ಪ್ರಶಸ್ತಿ ಸಂದಿದೆ.",
          category: "ಮನರಂಜನೆ",
          image_url: "ph ph-red",
          author: "ಸಿನಿಮಾ ವರದಿಗಾರ"
        },
        {
          title: "AI ಸಹಾಯದಿಂದ ಕನ್ನಡ ಭಾಷೆ ಡಿಜಿಟಲ್ — IISc ಹೊಸ ಸಂಶೋಧನೆ",
          content: "ಬೆಂಗಳೂರಿನ ಐಐಎಸ್ಸಿ ಸಂಶೋಧಕರು ಕನ್ನಡ ಭಾಷೆಯ ಡಿಜಿಟಲೀಕರಣಕ್ಕಾಗಿ ನೂತನ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ತಂತ್ರಜ್ಞಾನ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ.",
          category: "ತಂತ್ರಜ್ಞಾನ",
          image_url: "ph ph-teal",
          author: "ವಿಜ್ಞಾನ ಪ್ರತಿನಿಧಿ"
        },
        {
          title: "ISRO — ಚಂದ್ರಯಾನ-4 ಮಿಷನ್ ಅನುಮೋದನೆ, 2026 ಉಡಾವಣೆ",
          content: "ಭಾರತೀಯ ಬಾಹ್ಯಾಕಾಶ ಸಂಸ್ಥೆ ಇಸ್ರೋ ಚಂದ್ರಯಾನ-4 ಯೋಜನೆಗೆ ಸರ್ಕಾರದಿಂದ ಅನುಮೋದನೆ ಪಡೆದಿದ್ದು, 2026 ರಲ್ಲಿ ಉಡಾವಣೆ ಮಾಡಲು ಸಜ್ಜಾಗಿದೆ.",
          category: "ತಂತ್ರಜ್ಞಾನ",
          image_url: "ph ph-blue",
          author: "ಬಾಹ್ಯಾಕಾಶ ವರದಿಗಾರ"
        },
        {
          title: "Apple iPhone 17 ಲಾಂಚ್ — ಭಾರತದಲ್ಲಿ ಬೆಲೆ ₹89,999 ರಿಂದ",
          content: "ಆಪಲ್ ಸಂಸ್ಥೆಯ ಹೊಸ ಐಫೋನ್ 17 ಬಿಡುಗಡೆಯಾಗಿದ್ದು, ಭಾರತೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಇದರ ಆರಂಭಿಕ ಬೆಲೆ ₹89,999 ಆಗಿದೆ.",
          category: "ತಂತ್ರಜ್ಞಾನ",
          image_url: "ph ph-purple",
          author: "ಗ್ಯಾಜೆಟ್ಸ್ ಡೆಸ್ಕ್"
        },
        {
          title: "AIIMS ಬೆಂಗಳೂರು — ₹2,000 ಕೋಟಿ ಹೊಸ ಕ್ಯಾನ್ಸರ್ ಕೇಂದ್ರ",
          content: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಏಮ್ಸ್ ವತಿಯಿಂದ ಅತ್ಯಾಧುನಿಕ ಸೌಲಭ್ಯಗಳನ್ನು ಹೊಂದಿರುವ ₹2,000 ಕೋಟಿ ವೆಚ್ಚದ ಕ್ಯಾನ್ಸರ್ ಸಂಶೋಧನಾ ಕೇಂದ್ರ ಸ್ಥಾಪನೆಯಾಗುತ್ತಿದೆ.",
          category: "ಆರೋಗ್ಯ",
          image_url: "ph ph-green",
          author: "ಆರೋಗ್ಯ ವರದಿಗಾರ"
        },
        {
          title: "ಡೆಂಘ್ಯೂ ಎಚ್ಚರಿಕೆ — ಕರ್ನಾಟಕದಲ್ಲಿ 500 ಪ್ರಕರಣ ದಾಖಲು",
          content: "ರಾಜ್ಯದ ವಿವಿಧ ಭಾಗಗಳಲ್ಲಿ ಡೆಂಘ್ಯೂ ಜ್ವರ ಪ್ರಕರಣಗಳು ಹೆಚ್ಚಾಗಿದ್ದು, ಆರೋಗ್ಯ ಇಲಾಖೆಯು ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಲು ಸೂಚಿಸಿದೆ.",
          category: "ಆರೋಗ್ಯ",
          image_url: "ph ph-red",
          author: "ಆರೋಗ್ಯ ಪ್ರತಿನಿಧಿ"
        },
        {
          title: "ಯೋಗ ದಿನ 2025 — ಮೈಸೂರಿನಲ್ಲಿ 1 ಲಕ್ಷ ಜನ भागವಹಿಸಲಿ",
          content: "ಮುಂದಿನ ಜಾಗತಿಕ ಯೋಗ ದಿನಾಚರಣೆಯನ್ನು ಸಾಂಸ್ಕೃತಿಕ ನಗರಿ ಮೈಸೂರಿನಲ್ಲಿ ಭವ್ಯವಾಗಿ ಆಚರಿಸಲು ಸಿದ್ಧತೆ ನಡೆದಿದ್ದು, 1 ಲಕ್ಷ ಜನರು ಪಾಲ್ಗೊಳ್ಳುವ ನಿರೀಕ್ಷೆಯಿದೆ.",
          category: "ಆರೋಗ್ಯ",
          image_url: "ph ph-orange",
          author: "ಯೋಗ ಪ್ರತಿನಿಧಿ"
        }
      ];

      for (const art of defaultArticles) {
        await pool.query(
          "INSERT INTO articles (title, content, category, image_url, author) VALUES ($1, $2, $3, $4, $5)",
          [art.title, art.content, art.category, art.image_url, art.author]
        );
      }
      console.log("Default articles loaded into database");
    }

    // 3. Create Ticker Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticker (
        id SERIAL PRIMARY KEY,
        message TEXT,
        is_active INT DEFAULT 1
      )
    `);

    // Add link column if it doesn't exist
    await pool.query(`
      ALTER TABLE ticker ADD COLUMN IF NOT EXISTS link TEXT;
    `);


    // Seed default ticker messages if empty
    const tickerCheck = await pool.query("SELECT count(*) as count FROM ticker");
    if (parseInt(tickerCheck.rows[0].count) === 0) {
      const defaultTicker = [
        "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮೆಟ್ರೋ ಹೊಸ ಮಾರ್ಗ ಉದ್ಘಾಟನೆ — ಮುಖ್ಯಮಂತ್ರಿ ಹಸಿರು ನಿಶಾನೆ",
        "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಬಜೆಟ್ ಮಾರ್ಚ್ 7 ರಂದು ಮಂಡನೆ",
        "ಚಿನ್ನದ ಬೆಲೆ ₹68,500 ದಾಟಿತು — ₹400 ಹೆಚ್ಚಳ",
        "IPL 2025: RCB ಗೆ ಮೊದಲ ಗೆಲುವು — ವಿರಾಟ್ ಅರ್ಧಶತಕ",
        "ಕರ್ನಾಟಕದಲ್ಲಿ ವಾರಾಂತ್ಯ ಮಳೆ ಎಚ್ಚರಿಕೆ — IMD ಅಲರ್ಟ್",
        "ಕನ್ನಡ ಚಿತ್ರೋದ್ಯಮ ಪ್ರಶಸ್ತಿ ಸಮಾರಂಭ ಮಾರ್ಚ್ 15 ರಂದು",
        "ಮೈಸೂರು ದಸರಾ 2025 — ಸರ್ಕಾರ ₹50 ಕೋಟಿ ಅನುದಾನ ಘೋಷಣೆ"
      ];

      for (const msg of defaultTicker) {
        await pool.query("INSERT INTO ticker (message) VALUES ($1)", [msg]);
      }
      console.log("Default ticker tape items loaded");
    }

    // 4. Create Videos Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT,
        duration VARCHAR(50),
        video_url TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default videos if empty
    const videoCheck = await pool.query("SELECT count(*) as count FROM videos");
    if (parseInt(videoCheck.rows[0].count) === 0) {
      const defaultVideos = [
        { title: "ಬೆಂಗಳೂರು ಮೆಟ್ರೋ ನೀಲ್ ರೇಷ್ಮೆ ಉದ್ಘಾಟನೆ", duration: "3:24", video_url: "#", image_url: "ph ph-red" },
        { title: "ರಾಜ್ಯ ಬಜೆಟ್ ಮೇಲೆ ತಜ್ಞರ ವಿಶ್ಲೇಷಣೆ", duration: "8:15", video_url: "#", image_url: "ph ph-blue" },
        { title: "IPL: RCB ಗೆಲುವಿನ ಹೈಲೈಟ್ಸ್", duration: "5:42", video_url: "#", image_url: "ph ph-orange" },
        { title: "ಕಾಂತಾರ-2 ಶೂಟಿಂಗ್ ಫಸ್ಟ್ ಲುಕ್", duration: "12:08", video_url: "#", image_url: "ph ph-purple" }
      ];

      for (const v of defaultVideos) {
        await pool.query(
          "INSERT INTO videos (title, duration, video_url, image_url) VALUES ($1, $2, $3, $4)",
          [v.title, v.duration, v.video_url, v.image_url]
        );
      }
      console.log("Default videos loaded");
    }

    // 5. Create Opinions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opinions (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(255),
        author_role VARCHAR(255),
        author_avatar VARCHAR(50),
        headline TEXT,
        quote TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default opinions if empty
    const opinionCheck = await pool.query("SELECT count(*) as count FROM opinions");
    if (parseInt(opinionCheck.rows[0].count) === 0) {
      const defaultOpinions = [
        {
          author_name: "ಡಾ. ಕೆ. ರಾಮಚಂದ್ರ",
          author_role: "ಹಿರಿಯ ಸಂಪಾದಕ",
          author_avatar: "👨",
          headline: "ಕರ್ನಾಟಕದ ನೀರಾವರಿ ಬಿಕ್ಕಟ್ಟು — ನಾವು ಎಲ್ಲಿ ತಪ್ಪಾದೆವು?",
          quote: "ಕಾವೇರಿ ನೀರಿನ ವಿವಾದ ಹಳೆಯದಾದರೂ ಪರಿಹಾರ ಇಂದಿಗೂ ಮರೀಚಿಕೆಯಾಗಿದೆ..."
        },
        {
          author_name: "ಶ್ರೀಮತಿ ಅನಿತಾ ಮೂರ್ತಿ",
          author_role: "ಆರ್ಥಿಕ ವಿಶ್ಲೇಷಕ",
          author_avatar: "👩",
          headline: "IT ಉದ್ಯಮ ಮಂದಗತಿ — ಬೆಂಗಳೂರಿನ ಮೇಲೆ ಪರಿಣಾಮ",
          quote: "ಜಾಗತಿಕ ಮಂದಿಗತಿಯ ನಡುವೆ ಭಾರತದ ತಂತ್ರಜ್ಞಾನ ರಾಜಧಾನಿ ಎಂತಹ ಸವಾಲು ಎದುರಿಸುತ್ತಿದೆ..."
        },
        {
          author_name: "ಪ್ರೊ. ಎಸ್. ವಿಶ್ವನಾಥ್",
          author_role: "ರಾಜಕೀಯ ವಿಶ್ಲೇಷಕ",
          author_avatar: "👨‍💼",
          headline: "2028 ಕರ್ನಾಟಕ ಚುನಾವಣೆ — ಈಗಲೇ ಶುರುವಾದ ಸಮರ",
          quote: "ಮೂರು ವರ್ಷ ಮುಂಚೆಯೇ ಪ್ರಮುಖ ಪಕ್ಷಗಳು ತಮ್ಮ ಕಾರ್ಯತಂತ್ರ ರೂಪಿಸತೊಡಗಿವೆ..."
        }
      ];

      for (const op of defaultOpinions) {
        await pool.query(
          "INSERT INTO opinions (author_name, author_role, author_avatar, headline, quote) VALUES ($1, $2, $3, $4, $5)",
          [op.author_name, op.author_role, op.author_avatar, op.headline, op.quote]
        );
      }
      console.log("Default opinion articles loaded");
    }

    // 6. Create Polls Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        question TEXT,
        options_json TEXT,
        votes_json TEXT,
        is_active INT DEFAULT 1
      )
    `);

    // Seed active poll if empty
    const pollCheck = await pool.query("SELECT count(*) as count FROM polls");
    if (parseInt(pollCheck.rows[0].count) === 0) {
      const defaultPoll = {
        question: "2028 ಕರ್ನಾಟಕ ಚುನಾವಣೆಯಲ್ಲಿ ಯಾರು ಗೆಲ್ಲಬಹುದು?",
        options_json: JSON.stringify(["ಕಾಂಗ್ರೆಸ್", "BJP", "JDS", "ಇತರ"]),
        votes_json: JSON.stringify({ "ಕಾಂಗ್ರೆಸ್": 42, "BJP": 35, "JDS": 15, "ಇತರ": 8 }),
        is_active: 1
      };

      await pool.query(
        "INSERT INTO polls (question, options_json, votes_json, is_active) VALUES ($1, $2, $3, $4)",
        [defaultPoll.question, defaultPoll.options_json, defaultPoll.votes_json, defaultPoll.is_active]
      );
      console.log("Default active poll initialized");
    }

    // 7. Create Subscribers Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Create Photos Table (Gallery)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        image_url TEXT,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add views column if it doesn't exist
    await pool.query(`
      ALTER TABLE photos ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
    `);

    // Seed default photos if empty
    const photoCheck = await pool.query("SELECT count(*) as count FROM photos");
    if (parseInt(photoCheck.rows[0].count) === 0) {
      const defaultPhotos = [
        { image_url: "ph ph-red", caption: "Photo 1" },
        { image_url: "ph ph-blue", caption: "Photo 2" },
        { image_url: "ph ph-green", caption: "Photo 3" },
        { image_url: "ph ph-orange", caption: "Photo 4" }
      ];

      for (const photo of defaultPhotos) {
        await pool.query(
          "INSERT INTO photos (image_url, caption) VALUES ($1, $2)",
          [photo.image_url, photo.caption]
        );
      }
      console.log("Default photos loaded");
    }

    console.log('✅ PostgreSQL database tables and connections verified successfully.');
  } catch (migrationErr) {
    console.error("❌ Database Migration Error:", migrationErr.message);
  }
};

// Initialize schema on server boot
initializeDatabase();

module.exports = db;
