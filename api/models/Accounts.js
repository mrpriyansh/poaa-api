const mongoose = require('mongoose');

const Account = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    accountNo: {
      type: String,
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
    agentId1: {
      type: String,
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
