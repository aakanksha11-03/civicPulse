const r = require('express').Router();
const { Complaint, Category, User } = require('../models');
const { auth, allow, upload } = require('../middleware'); const U = require('../utils');
const wrap = f => (q, s, n) => f(q, s, n).catch(e => s.status(500).json({ message: e.message }));
const pop = q => q.populate('citizen', 'name email').populate('officer', 'name email department');
const OPEN = ['submitted', 'assigned', 'accepted', 'in_progress', 'escalated'];
const log = (c, status, note, by) => { c.status = status; c.history.push({ status, note, by: by.name }); };

r.post('/', auth, allow('citizen'), upload.array('photos', 4), wrap(async (req, res) => {
  const { title, description, lat, lng, address } = req.body;
  if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
  const text = title + ' ' + description, cat = U.classify(text, await Category.find());
  const c = new Complaint({ title, description, citizen: req.user._id, photos: (req.files || []).map(f => '/uploads/' + f.filename),
    category: req.body.category || cat?.name || 'Other', department: cat?.department, priority: U.priorityFor(text),
    location: { lat: +lat || undefined, lng: +lng || undefined, address }, dueAt: Date.now() + (cat?.slaHours || 72) * 3600000 });
  if (c.location.lat && c.location.lng) {
    const near = await Complaint.find({ category: c.category, status: { $in: OPEN }, duplicateOf: null, 'location.lat': { $exists: true } });
    const dup = near.find(o => U.distance(o.location, c.location) < 150);
    if (dup) { c.duplicateOf = dup._id; dup.duplicateCount++; await dup.save(); }
  }
  log(c, 'submitted', c.duplicateOf ? 'Flagged as a possible duplicate' : 'Complaint submitted', req.user);
  await c.save(); await U.notifyRole('admin', `New ${c.priority} complaint: ${c.title}`, c._id);
  res.json(c);
}));
r.get('/', auth, wrap(async (req, res) => {
  const f = {}, { role, _id } = req.user;
  if (role === 'citizen') f.citizen = _id; if (role === 'officer') f.officer = _id;
  for (const k of ['status', 'category', 'priority']) if (req.query[k]) f[k] = req.query[k];
  if (req.query.overdue) { f.dueAt = { $lt: new Date() }; f.status = { $in: OPEN }; }
  res.json(await pop(Complaint.find(f).sort({ createdAt: -1 })));
}));
r.get('/:id', auth, wrap(async (req, res) => {
  const c = await pop(Complaint.findById(req.params.id)); if (!c) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'citizen' && String(c.citizen._id) !== String(req.user._id)) return res.status(403).json({ message: 'Not yours' });
  res.json(c);
}));
r.put('/:id/assign', auth, allow('admin'), wrap(async (req, res) => {
  const c = await Complaint.findById(req.params.id), o = await User.findOne({ _id: req.body.officer, role: 'officer' });
  if (!c || !o) return res.status(400).json({ message: 'Complaint or officer not found' });
  c.officer = o._id; c.department = o.department; c.rejectionReason = undefined;
  if (req.body.priority) c.priority = req.body.priority; if (req.body.category) c.category = req.body.category;
  log(c, 'assigned', `Assigned to ${o.name} (${o.department || 'no department'})`, req.user); await c.save();
  await U.notify(o._id, `New complaint assigned: ${c.title}`, c._id); await U.notify(c.citizen, `Your complaint "${c.title}" was assigned to ${o.department}`, c._id); res.json(c);
}));
r.put('/:id/respond', auth, allow('officer'), wrap(async (req, res) => {
  const c = await Complaint.findOne({ _id: req.params.id, officer: req.user._id });
  if (!c) return res.status(404).json({ message: 'Not assigned to you' });
  if (req.body.accept) log(c, 'accepted', 'Officer accepted', req.user);
  else { if (!req.body.reason) return res.status(400).json({ message: 'A reason is required to reject' }); c.rejectionReason = req.body.reason; c.officer = undefined; log(c, 'rejected', req.body.reason, req.user); await U.notifyRole('admin', `Assignment rejected: ${c.title} (${req.body.reason})`, c._id); }
  await c.save(); await U.notify(c.citizen, `Your complaint "${c.title}" is now ${c.status}`, c._id); res.json(c);
}));
r.put('/:id/status', auth, allow('officer'), upload.array('photos', 4), wrap(async (req, res) => {
  const c = await Complaint.findOne({ _id: req.params.id, officer: req.user._id }); const s = req.body.status;
  if (!c) return res.status(404).json({ message: 'Not assigned to you' });
  if (!['in_progress', 'resolved'].includes(s)) return res.status(400).json({ message: 'Invalid status' });
  c.progressPhotos.push(...(req.files || []).map(f => '/uploads/' + f.filename));
  if (s === 'resolved') { if (!req.body.note) return res.status(400).json({ message: 'Add a resolution note' }); c.resolutionNote = req.body.note; await U.notifyRole('supervisor', `Ready to verify: ${c.title}`, c._id); }
  log(c, s, req.body.note || 'Work started', req.user); await c.save();
  await U.notify(c.citizen, `Your complaint "${c.title}" is now ${s.replace('_', ' ')}`, c._id); res.json(c);
}));
r.put('/:id/verify', auth, allow('supervisor'), wrap(async (req, res) => {
  const c = await Complaint.findById(req.params.id); if (!c || c.status !== 'resolved') return res.status(400).json({ message: 'Only resolved complaints can be verified' });
  if (req.body.approve === false) { log(c, 'in_progress', req.body.note || 'Work sent back by supervisor', req.user); await U.notify(c.officer, `Rework needed: ${c.title}`, c._id); }
  else { log(c, 'verified', 'Supervisor verified the work', req.user); await U.notify(c.citizen, `"${c.title}" is resolved. Please leave feedback.`, c._id); }
  await c.save(); res.json(c);
}));
r.put('/:id/escalate', auth, allow('supervisor'), wrap(async (req, res) => {
  const c = await Complaint.findById(req.params.id); if (!c) return res.status(404).json({ message: 'Not found' });
  c.priority = 'urgent'; log(c, 'escalated', req.body.note || 'Escalated by supervisor', req.user); await c.save();
  await U.notifyRole('admin', `Escalated: ${c.title}`, c._id); await U.notify(c.officer, `Escalated: ${c.title}`, c._id); res.json(c);
}));
r.post('/:id/feedback', auth, allow('citizen'), wrap(async (req, res) => {
  const c = await Complaint.findOne({ _id: req.params.id, citizen: req.user._id });
  if (!c || c.status !== 'verified') return res.status(400).json({ message: 'Feedback opens once work is verified' });
  c.feedback = { rating: Math.min(5, Math.max(1, +req.body.rating || 3)), comment: req.body.comment }; await c.save(); res.json(c);
}));
module.exports = r;
