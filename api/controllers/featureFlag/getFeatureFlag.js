const { ErrorHandler } = require('../../../services/handleError');
const FeatureFlag = require('../../models/FeatureFlag');

module.exports = async (req, res, next) => {
  try {
    if (!req.query.name) throw new ErrorHandler(400, 'Feature Flag not found');
    const featureFlag = await FeatureFlag.findOne({ ...req.query });
    console.log(featureFlag, req.query);
    res.json(featureFlag);
  } catch (err) {
    next(err);
  }
};
