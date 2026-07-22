const mongoose = require('mongoose');
const vendorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  region: { type: String, default: 'IN' },
  commissionRate: { type: Number, default: 0.15 },
  stripeAccountId: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });
module.exports = mongoose.model('Vendor', vendorSchema);