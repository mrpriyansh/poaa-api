const Banner = require('../../models/Banner');

module.exports = async (_, res, next) => {
  try {
    const featureFlags = await Banner.findOne();
    res.json(featureFlags);
  } catch (err) {
    next(err);
  }
};
