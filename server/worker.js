require('dotenv').config();
const connectDB = require('./config/db');

connectDB();
require('./queues/payoutWorker');

console.log('Payout worker is running and listening for jobs...');