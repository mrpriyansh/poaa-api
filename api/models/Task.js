const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    status: {
      type: String,
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
    misc: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
