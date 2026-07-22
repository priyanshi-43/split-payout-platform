const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

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

module.exports = router;