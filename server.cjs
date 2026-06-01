const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const authRouter = require('./routes/auth.cjs');
const publicRouter = require('./routes/public.cjs');
const adminRouter = require('./routes/admin.cjs');
const { uploadDir } = require('./middleware/upload.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static resources
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'dist')));

// Mount Sub-Routers
app.use('/api/auth', authRouter);
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

// Single Page Application Catch-All
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
