const mongoose = require('mongoose');

const Account = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    accountno: {
      type: Number,
      required: true,
      unique: true,
    },
    accountType: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    openingDate: {
      type: Date,
      required: true,
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    agentDetails: {
      type: Object,
      required: true,
    },
    mobile: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Account', Account);
