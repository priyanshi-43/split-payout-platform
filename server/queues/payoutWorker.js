const { Worker } = require('bullmq');
const Payout = require('../models/Payout');
const paymentService = require('../services/mockPaymentService');

const connection = { url: process.env.REDIS_URL };

const worker = new Worker('payouts', async (job) => {
  const payout = await Payout.findById(job.data.payoutId);
  if (!payout) return;

  try {
    const transfer = paymentService.createTransfer(payout.amount, payout.vendorId.toString());
    payout.status = 'succeeded';
    payout.stripeTransferId = transfer.id;
  } catch (err) {
    payout.status = 'failed';
    payout.failureReason = err.message;
    payout.attempts += 1;
  }
  await payout.save();
}, { connection });

worker.on('completed', (job) => {
  console.log(`Payout job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.log(`Payout job ${job.id} failed: ${err.message}`);
});

module.exports = worker;