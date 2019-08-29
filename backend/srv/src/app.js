const express = require('express');
const mongoose = require('mongoose');
const conversionRoutes = require('./api/routes/conversion');
const cors = require('cors');

const mongoEndpoint = process.env.MONGO_ENDPOINT || 'mongodb://localhost:27017/expressmongo';
const domainWhitelist = ['localhost'];

mongoose.connect(
    mongoEndpoint,
    { useNewUrlParser: true }
)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Represents our application
const app = express();

// Attach middleware
app.use(cors());
app.use(express.json());
app.use('/api/conversions', conversionRoutes);

app.get('/',(req, res) => res.status(200).json(
    { message: 'PrismPDF 2019'}
    ));

app.get('/api', (req, res) => res.status(200).json(
        { message: 'PrismPDF API 2019' }
    ));

module.exports = app;