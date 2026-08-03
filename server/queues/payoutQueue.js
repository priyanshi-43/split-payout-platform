const { Queue } = require('bullmq');

const connection = { url: process.env.REDIS_URL };

const payoutQueue = new Queue('payouts', { connection });

module.exports = payoutQueue;
