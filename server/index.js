require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.use('/api/orders', require('./routes/orders'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));