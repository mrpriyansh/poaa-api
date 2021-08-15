const { ObjectId, Date } = require('mongoose');
const mongoose = require('mongoose');

const Installment = new mongoose.Schema(
  {
    accountno: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    agentId: {
      type: ObjectId,
      required: true,
    },
    installments: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    listedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Installment', Installment);
