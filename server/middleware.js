const jwt = require('jsonwebtoken'); const multer = require('multer'); const path = require('path');
const { User } = require('./models');
exports.auth = async (req, res, next) => {
  try { const t = (req.headers.authorization || '').replace('Bearer ', '');
    const d = jwt.verify(t, process.env.JWT_SECRET); req.user = await User.findById(d.id).select('-password');
    if (!req.user) throw 0; next();
  } catch { res.status(401).json({ message: 'Please log in' }); }
};
exports.allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Not allowed for your role' });
exports.upload = multer({
  storage: multer.diskStorage({ destination: path.join(__dirname, 'uploads'), filename: (q, f, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(f.originalname)) }),
  limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (q, f, cb) => cb(null, /^image\//.test(f.mimetype))
});
