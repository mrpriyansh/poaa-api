const mongoose = require('mongoose');
const config = require('./config');

const db = config.mongoURI + (process.env.NODE_ENV === 'production' ? '' : '-dev');
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info('MongoDB Connected...', db);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
