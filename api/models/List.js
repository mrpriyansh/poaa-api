const mongoose = require('mongoose');

const List = new mongoose.Schema(
  {
    list: {
      type: Array,
    },
    agentId: {
      type: String,
    },
    status: {
      type: String,
    },
    taskId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('List', List);
