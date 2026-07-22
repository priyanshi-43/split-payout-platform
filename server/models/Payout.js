const mongoose = require('mongoose');
const payoutSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  amount: Number,
  status: { type: String, default: 'pending' },
  stripeTransferId: String,
  idempotencyKey: String,
  attempts: { type: Number, default: 0 },
  failureReason: String
}, { timestamps: true });
module.exports = mongoose.model('Payout', payoutSchema);