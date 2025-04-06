const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    error: {
      type: Schema.Types.Mixed,
    },
    type: {
      type: String,
    },
    progress: {
      type: Schema.Types.Mixed,
    },
    message: {
      type: String,
    },
    pid: {
      type: Number,
      required: true,
    },
    browserPid: {
      type: Number,
    },
    listData: {
      type: Object,
    },
    agentId: {
      type: Schema.Types.ObjectId,
    },
    misc: {
      type: Schema.Types.Mixed,
    },
    globalTimeout: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
