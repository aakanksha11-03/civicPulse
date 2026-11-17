require('dotenv').config(); const express = require('express'), cors = require('cors'), mongoose = require('mongoose'), path = require('path');
const app = express(); app.use(cors(), express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth')); app.use('/api/complaints', require('./routes/complaints')); app.use('/api', require('./routes/admin'));
app.get('/api/health', (q, s) => s.json({ ok: true }));
mongoose.connect(process.env.MONGO_URI).then(() => app.listen(process.env.PORT || 5000, () => console.log('CivicPulse API on :' + (process.env.PORT || 5000))))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
