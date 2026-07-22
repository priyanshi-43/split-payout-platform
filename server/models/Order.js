const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customerEmail: String,
  items: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    productName: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  paymentIntentId: String
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);