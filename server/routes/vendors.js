const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const Vendor = require('../models/Vendor');

router.get('/:id/payouts', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const payouts = await Payout.find({ vendorId: req.params.id }).sort({ createdAt: -1 });

    const summary = {
      totalEarned: payouts.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalPayouts: payouts.length
    };

    res.json({ vendor: { name: vendor.name, email: vendor.email }, summary, payouts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;