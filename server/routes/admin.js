const r = require('express').Router(); const bcrypt = require('bcryptjs');
const { User, Category, Complaint, Notification } = require('../models'); const { auth, allow } = require('../middleware');
const wrap = f => (q, s, n) => f(q, s, n).catch(e => s.status(500).json({ message: e.message }));
const DONE = ['resolved', 'verified'];
r.get('/categories', auth, wrap(async (q, s) => s.json(await Category.find())));
r.post('/categories', auth, allow('admin'), wrap(async (q, s) => s.json(await Category.create({ ...q.body, keywords: (q.body.keywords || '').toString().split(',').map(x => x.trim()).filter(Boolean) }))));
r.delete('/categories/:id', auth, allow('admin'), wrap(async (q, s) => { await Category.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
r.get('/users', auth, allow('admin', 'supervisor'), wrap(async (q, s) => s.json(await User.find(q.query.role ? { role: q.query.role } : {}).select('-password'))));
r.post('/users', auth, allow('admin'), wrap(async (q, s) => {
  const { name, email, password, role, department } = q.body;
  if (!['officer', 'supervisor', 'admin'].includes(role)) return s.status(400).json({ message: 'Invalid role' });
  s.json(await User.create({ name, email, role, department, verified: true, password: await bcrypt.hash(password || 'Staff@123', 10) }));
}));
r.put('/users/:id', auth, allow('admin'), wrap(async (q, s) => s.json(await User.findByIdAndUpdate(q.params.id, { role: q.body.role, department: q.body.department }, { new: true }).select('-password'))));
r.delete('/users/:id', auth, allow('admin'), wrap(async (q, s) => { await User.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
r.get('/stats', auth, allow('admin', 'supervisor'), wrap(async (q, s) => {
  const all = await Complaint.find(), by = k => all.reduce((a, c) => { const v = c[k] || 'Unassigned'; a[v] = (a[v] || 0) + 1; return a; }, {});
  const late = c => !DONE.includes(c.status) && c.status !== 'verified' && c.dueAt < Date.now(), depts = {};
  for (const c of all) { const d = c.department || 'Unassigned'; const x = depts[d] ||= { total: 0, resolved: 0, overdue: 0, hours: 0, rated: 0, rating: 0 }; x.total++;
    if (DONE.includes(c.status)) { x.resolved++; const h = c.history.find(h => h.status === 'resolved'); if (h) x.hours += (h.at - c.createdAt) / 36e5; }
    else if (late(c)) x.overdue++;
    if (c.feedback?.rating) { x.rated++; x.rating += c.feedback.rating; } }
  Object.values(depts).forEach(x => { x.avgHours = x.resolved ? +(x.hours / x.resolved).toFixed(1) : 0; x.avgRating = x.rated ? +(x.rating / x.rated).toFixed(1) : 0; delete x.hours; delete x.rated; delete x.rating; });
  const staff = await User.find({ role: 'officer' }), officers = staff.map(o => { const mine = all.filter(c => String(c.officer) === String(o._id));
    return { name: o.name, department: o.department, assigned: mine.length, resolved: mine.filter(c => DONE.includes(c.status)).length }; });
  s.json({ total: all.length, resolved: all.filter(c => DONE.includes(c.status)).length, overdue: all.filter(late).length,
    byStatus: by('status'), byCategory: by('category'), byPriority: by('priority'), departments: depts, officers });
}));
r.get('/notifications', auth, wrap(async (q, s) => s.json(await Notification.find({ user: q.user._id }).sort({ createdAt: -1 }).limit(50))));
r.put('/notifications/read', auth, wrap(async (q, s) => { await Notification.updateMany({ user: q.user._id }, { read: true }); s.json({ ok: true }); }));
module.exports = r;
