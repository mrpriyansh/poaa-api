const mongoose = require('mongoose');

const List = new mongoose.Schema(
  {
    list: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('List', List);
