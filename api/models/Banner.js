const mongoose = require('mongoose');

const Banner = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    metaInfo: {
      type: Object,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', Banner);
