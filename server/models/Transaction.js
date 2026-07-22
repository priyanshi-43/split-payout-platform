const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  breakdown: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    grossAmount: Number,
    platformFee: Number,
    taxAmount: Number,
    netPayout: Number
  }],
  totalPlatformFee: Number,
  totalTax: Number,
  roundingAdjustment: Number
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transactionSchema);