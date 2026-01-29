const mongoose = require('mongoose');
require('dotenv').config();
const mongoURL = process.env.DB_URL_LOCAL; // Local DATABASE CONNECTION DATA STORED LOCALLY MONGO DB COMPASS replace 'hotels' with your DB name
//const mongoURL=process.env.DB_URL;//GLOBAL DATABASE DATA STORED IN MONGO ATLAS MongoAtlas

mongoose.connect(mongoURL); // no need for deprecated options

const db = mongoose.connection;

db.on('connected', () => {
    console.log('MongoDB connected successfully');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = db;
