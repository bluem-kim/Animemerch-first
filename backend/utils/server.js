const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const connectDatabase = require('../config/database');
require('../config/cloudinary');
const productRoutes = require('../routes/productRoutes');
const reviewRoutes = require('../routes/reviewRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api', productRoutes);
app.use('/api', reviewRoutes);

const PORT = process.env.PORT || 5000;

connectDatabase();

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
