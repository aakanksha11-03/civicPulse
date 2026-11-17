const jwt = require('jsonwebtoken'); const nodemailer = require('nodemailer');
const { User, Notification } = require('./models');
const URGENT = ['fire', 'accident', 'live wire', 'electrocut', 'flood', 'collapse', 'gas leak', 'sinkhole', 'danger', 'emergency', 'open manhole'];
const HIGH = ['overflow', 'burst', 'blocked', 'no water', 'power cut', 'sewage', 'broken', 'school', 'hospital'];
exports.priorityFor = t => { t = t.toLowerCase(); return URGENT.some(k => t.includes(k)) ? 'urgent' : HIGH.some(k => t.includes(k)) ? 'high' : 'medium'; };
exports.classify = (text, cats) => {
  text = text.toLowerCase(); let best = null, score = 0;
  for (const c of cats) { const s = c.keywords.filter(k => text.includes(k.toLowerCase())).length; if (s > score) { score = s; best = c; } }
  return best;
};
exports.distance = (a, b) => { const r = x => x * Math.PI / 180, R = 6371000;
  const d = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(d)); };
exports.sign = u => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
exports.notify = async (user, message, complaint) => { if (user) await Notification.create({ user, message, complaint }); };
exports.notifyRole = async (role, message, complaint) => { for (const u of await User.find({ role })) await exports.notify(u._id, message, complaint); };
exports.mail = async (to, subject, text) => {
  if (!process.env.SMTP_HOST) return console.log(`\n[EMAIL to ${to}] ${subject}\n${text}\n`);
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await t.sendMail({ from: process.env.SMTP_USER, to, subject, text });
};
