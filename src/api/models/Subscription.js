const mongoose = require('mongoose');

const Subscription = new mongoose.Schema(
  {
    endpoint: { type: String, unique: true, required: true },
    expirationTime: { type: Number },
    keys: {
      auth: String,
      p256dh: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('subscription', Subscription);
