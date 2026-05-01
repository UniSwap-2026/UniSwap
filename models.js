// models.js
// ══════════════════════════════════════════
//  All Mongoose Models — UniSwap
// ══════════════════════════════════════════

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── User ──────────────────────────────────
const userSchema = new Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  domain:        { type: String, required: true, enum: ['medical', 'engineering', 'arts'] },
  college:       { type: String, default: null },
  year:          { type: String, default: null },
  trust_points:  { type: Number, default: 0 },
  is_verified:   { type: Boolean, default: false },
}, { timestamps: true });

// ── Listing ───────────────────────────────
const listingSchema = new Schema({
  user_id:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: null },
  domain:      { type: String, required: true, enum: ['medical', 'engineering', 'arts'] },
  category:    { type: String, default: null },
  type:        { type: String, required: true, enum: ['donate', 'swap', 'sell'] },
  price:       { type: Number, default: null },
  condition:   { type: String, required: true, enum: ['excellent', 'very_good', 'good', 'acceptable'] },
  is_urgent:   { type: Boolean, default: false },
  status:      { type: String, default: 'available', enum: ['available', 'pending', 'closed'] },
  images:      [{ type: String }],
}, { timestamps: true });

// ── Request ───────────────────────────────
const requestSchema = new Schema({
  listing_id:       { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  requester_id:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  message:          { type: String, default: null },
  status:           { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected', 'done'] },
  exchange_code_a:  { type: String, default: null }, // seller code
  exchange_code_b:  { type: String, default: null }, // buyer code
}, { timestamps: true });

// ── Message ───────────────────────────────
const messageSchema = new Schema({
  request_id: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  sender_id:  { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  body:       { type: String, required: true },
  is_read:    { type: Boolean, default: false },
}, { timestamps: { createdAt: 'sent_at', updatedAt: false } });

// ── Need ──────────────────────────────────
const needSchema = new Schema({
  user_id:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  domain:    { type: String, required: true, enum: ['medical', 'engineering', 'arts'] },
  is_urgent: { type: Boolean, default: false },
  status:    { type: String, default: 'open', enum: ['open', 'fulfilled'] },
}, { timestamps: true });

// ── Hub Content ───────────────────────────
const hubContentSchema = new Schema({
  user_id:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  type:      { type: String, required: true, enum: ['summary', 'notes', 'exam'] },
  domain:    { type: String, required: true, enum: ['medical', 'engineering', 'arts'] },
  year:      { type: String, default: null },
  file_url:  { type: String, required: true },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

// ── Rating ────────────────────────────────
const ratingSchema = new Schema({
  request_id: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  rater_id:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  rated_id:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  stars:      { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: null },
}, { timestamps: true });

// Prevent duplicate ratings for the same deal
ratingSchema.index({ request_id: 1, rater_id: 1 }, { unique: true });

// ── Notification ──────────────────────────
const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, required: true },
  ref_id:  { type: Schema.Types.ObjectId, default: null },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

// ── Exports ───────────────────────────────
module.exports = {
  User:         mongoose.model('User',         userSchema),
  Listing:      mongoose.model('Listing',      listingSchema),
  Request:      mongoose.model('Request',      requestSchema),
  Message:      mongoose.model('Message',      messageSchema),
  Need:         mongoose.model('Need',         needSchema),
  HubContent:   mongoose.model('HubContent',   hubContentSchema),
  Rating:       mongoose.model('Rating',       ratingSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
