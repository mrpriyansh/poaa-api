const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');

const List = new mongoose.Schema(
  {
    list: {
      type: Array,
      required: true,
    },
    agentId: {
      type: ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    taskId: {
      type: ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('List', List);
