const { ErrorHandler } = require('../../../services/handleError');
const Subscription = require('../../models/Subscription');

module.exports = async function(req, res, next) {
  try {
    if (!req.body) throw new ErrorHandler(400, "Doesn't get subscription object");
    const exists = await Subscription.findOne({ endpoint: req.body.endpoint });
    if (exists) return res.json('Already subscribed');
    await Subscription.create(req.body);
    res.status(201).json('Subscribed to notification');
  } catch (err) {
    next(err);
  }
};
