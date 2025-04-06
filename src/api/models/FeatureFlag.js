const mongoose = require('mongoose');

const FeatureFlag = new mongoose.Schema(
  {
    active: {
      type: Boolean,
      required: true,
    },
    name: {
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

module.exports = mongoose.model('featureFlag', FeatureFlag);
