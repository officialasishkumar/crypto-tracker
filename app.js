require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cryptoDB';
const PORT = process.env.PORT || 3002;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const priceSchema = new mongoose.Schema({
  coin: { type: String, required: true },
  price: { type: Number, required: true },
  marketCap: { type: Number, required: true },
  change24h: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Price = mongoose.model('Price', priceSchema);

const app = express();

cron.schedule('0 */2 * * *', async () => {
  console.log('Fetching latest cryptocurrency data from CoinGecko...');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: 'bitcoin,matic-network,ethereum'
      }
    });

    const coinsData = response.data;
    for (const coinData of coinsData) {
      const { id, current_price, market_cap, price_change_percentage_24h } = coinData;

      const record = new Price({
        coin: id,
        price: current_price,
        marketCap: market_cap,
        change24h: price_change_percentage_24h
      });
      await record.save();
      console.log(`Saved data for ${id}`);
    }
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error.message);
  }
});

// Task 2: /stats endpoint
app.get('/stats', async (req, res) => {
  const { coin } = req.query;
  if (!coin) {
    return res.status(400).json({ error: 'Coin query parameter is required' });
  }

  try {
    const latestRecord = await Price.findOne({ coin }).sort({ createdAt: -1 }).lean();
    if (!latestRecord) {
      return res.status(404).json({ error: 'No data found for the specified coin' });
    }

    res.json({
      price: latestRecord.price,
      marketCap: latestRecord.marketCap,
      "24hChange": latestRecord.change24h
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function standardDeviation(values) {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / n;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

// Task 3: /deviation endpoint
app.get('/deviation', async (req, res) => {
  const { coin } = req.query;
  if (!coin) {
    return res.status(400).json({ error: 'Coin query parameter is required' });
  }

  try {
    const records = await Price.find({ coin })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (!records.length) {
      return res.status(404).json({ error: 'No data found for the specified coin' });
    }

    const prices = records.map(record => record.price);
    const deviation = standardDeviation(prices);
    res.json({
      deviation: Math.round(deviation * 100) / 100
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/updateAll', async (req, res) => {
  console.log('Manual update for all cryptocurrencies triggered...');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: 'bitcoin,matic-network,ethereum'
      }
    });

    const coinsData = response.data;
    for (const coinData of coinsData) {
      const { id, current_price, market_cap, price_change_percentage_24h } = coinData;

      const record = new Price({
        coin: id,
        price: current_price,
        marketCap: market_cap,
        change24h: price_change_percentage_24h
      });
      await record.save();
      console.log(`Manually saved data for ${id}`);
    }

    res.json({ message: 'Cryptocurrency data updated successfully!' });
  } catch (error) {
    console.error('Error during manual update:', error.message);
    res.status(500).json({ error: 'Failed to update cryptocurrency data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
