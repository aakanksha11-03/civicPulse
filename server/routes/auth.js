const r = require('express').Router(); const bcrypt = require('bcryptjs'); const crypto = require('crypto');
const { User } = require('../models'); const { auth } = require('../middleware'); const { sign, mail } = require('../utils');
const wrap = f => (q, s, n) => f(q, s, n).catch(e => s.status(500).json({ message: e.message }));
r.post('/register', wrap(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a password of 6+ characters are required' });
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
  const auto = process.env.AUTO_VERIFY === 'true', verifyToken = crypto.randomBytes(20).toString('hex');
  await User.create({ name, email, phone, password: await bcrypt.hash(password, 10), verified: auto, verifyToken });
  if (!auto) await mail(email, 'Verify your CivicPulse account', `${process.env.CLIENT_URL}/verify/${verifyToken}`);
  res.json({ message: auto ? 'Registered. You can log in now.' : 'Registered. Check your email to verify your account.' });
}));
r.get('/verify/:token', wrap(async (req, res) => {
  const u = await User.findOne({ verifyToken: req.params.token });
  if (!u) return res.status(400).json({ message: 'Invalid verification link' });
  u.verified = true; u.verifyToken = undefined; await u.save(); res.json({ message: 'Email verified. You can log in.' });
}));
r.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(400).json({ message: 'Wrong email or password' });
  if (!u.verified) return res.status(403).json({ message: 'Verify your email first' });
  u.password = undefined; res.json({ token: sign(u), user: u });
}));
r.post('/forgot', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (u) { u.resetToken = crypto.randomBytes(20).toString('hex'); u.resetExpires = Date.now() + 3600000; await u.save();
    await mail(u.email, 'Reset your CivicPulse password', `${process.env.CLIENT_URL}/reset/${u.resetToken}`); }
  res.json({ message: 'If that email exists, a reset link has been sent.' });
}));
r.post('/reset/:token', wrap(async (req, res) => {
  const u = await User.findOne({ resetToken: req.params.token, resetExpires: { $gt: Date.now() } });
  if (!u || !req.body.password || req.body.password.length < 6) return res.status(400).json({ message: 'Invalid or expired link, or password too short' });
  u.password = await bcrypt.hash(req.body.password, 10); u.resetToken = undefined; await u.save(); res.json({ message: 'Password updated. Log in.' });
}));
r.get('/me', auth, (req, res) => res.json(req.user));
r.put('/me', auth, wrap(async (req, res) => {
  const u = await User.findById(req.user._id);
  if (req.body.name) u.name = req.body.name; if (req.body.phone !== undefined) u.phone = req.body.phone;
  if (req.body.password) { if (req.body.password.length < 6) return res.status(400).json({ message: 'Password too short' }); u.password = await bcrypt.hash(req.body.password, 10); }
  await u.save(); u.password = undefined; res.json(u);
}));
module.exports = r;
