const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const paymentService = require('../services/mockPaymentService');
const { calculateSplit } = require('../services/splitCalculator');

router.post('/checkout', async (req, res) => {
  try {
    const { customerEmail, items } = req.body;
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({ customerEmail, items, totalAmount });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const intent = paymentService.createPaymentIntent(Math.round(order.totalAmount * 100));
    order.paymentIntentId = intent.id;
    await order.save();

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    paymentService.confirmPayment(order.paymentIntentId);
    order.status = 'paid';
    await order.save();

    // Get all unique vendors involved in this order
    const vendorIds = [...new Set(order.items.map(i => i.vendorId.toString()))];
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });

    // Safety check: make sure every vendor referenced in the order actually exists
    if (vendors.length !== vendorIds.length) {
      return res.status(400).json({
        error: 'One or more vendors in this order do not exist in the database',
        expectedVendorIds: vendorIds,
        foundVendorIds: vendors.map(v => v._id.toString())
      });
    }

    // Calculate the split
    const split = calculateSplit(order, vendors);

    // Save the transaction record (the calculation)
    const transaction = await Transaction.create({
      orderId: order._id,
      breakdown: split.breakdown,
      totalPlatformFee: split.totalPlatformFee,
      totalTax: split.totalTax,
      roundingAdjustment: split.roundingAdjustment
    });

    // Create a pending Payout for each vendor (held in escrow until delivery)
    const payouts = [];
    for (const line of split.breakdown) {
      const payout = await Payout.create({
        transactionId: transaction._id,
        vendorId: line.vendorId,
        amount: line.netPayout,
        idempotencyKey: `${transaction._id}-${line.vendorId}`
      });
      payouts.push(payout);
    }

    res.json({ message: 'Payment confirmed and split calculated', order, transaction, payouts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/deliver', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'delivered';
    await order.save();

    // In the next phase, this is where we'll trigger actual payout release via a queue
    const payouts = await Payout.find({ vendorId: { $in: order.items.map(i => i.vendorId) } });

    res.json({ message: 'Order marked delivered — payouts ready for release', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/debug/orders', async (req, res) => {
  const allOrders = await Order.find({});
  res.json(allOrders);
});
router.post('/:id/refund-item', async (req, res) => {
  try {
    const { vendorId, refundAmount } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const transaction = await Transaction.findOne({ orderId: order._id });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found for this order' });

    const payout = await Payout.findOne({ transactionId: transaction._id, vendorId });
    if (!payout) return res.status(404).json({ error: 'Payout not found for this vendor' });

    payout.amount = payout.amount - refundAmount;
    if (payout.status === 'succeeded') {
      payout.status = 'reversed';
    }
    await payout.save();

    order.status = 'partially_refunded';
    await order.save();

    res.json({ message: 'Refund processed for this vendor only', order, updatedPayout: payout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;