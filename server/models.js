const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = mongoose.model('User', new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, phone: String,
  role: { type: String, enum: ['citizen', 'admin', 'officer', 'supervisor'], default: 'citizen' },
  department: String, verified: { type: Boolean, default: false }, verifyToken: String,
  resetToken: String, resetExpires: Date
}, { timestamps: true }));
const Category = mongoose.model('Category', new Schema({
  name: { type: String, unique: true }, department: String, keywords: [String], slaHours: { type: Number, default: 72 }
}));
const Notification = mongoose.model('Notification', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' }, message: String, complaint: { type: Schema.Types.ObjectId, ref: 'Complaint' }, read: { type: Boolean, default: false }
}, { timestamps: true }));
const Complaint = mongoose.model('Complaint', new Schema({
  title: String, description: String, category: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['submitted', 'assigned', 'accepted', 'rejected', 'in_progress', 'resolved', 'verified', 'escalated'], default: 'submitted' },
  location: { lat: Number, lng: Number, address: String },
  photos: [String], progressPhotos: [String],
  citizen: { type: Schema.Types.ObjectId, ref: 'User' }, officer: { type: Schema.Types.ObjectId, ref: 'User' },
  department: String, rejectionReason: String, resolutionNote: String,
  duplicateOf: { type: Schema.Types.ObjectId, ref: 'Complaint' }, duplicateCount: { type: Number, default: 0 },
  feedback: { rating: Number, comment: String }, dueAt: Date,
  history: [{ status: String, note: String, by: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true }));
module.exports = { User, Category, Notification, Complaint };
