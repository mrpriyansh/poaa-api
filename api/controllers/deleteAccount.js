const { ErrorHandler } = require('../../services/handleError');
const Accounts = require('../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    await Accounts.deleteOne({ accountno: req.body.accountno });
    res.json('Account Deleted Successfully!');
  } catch (err) {
    next(err);
  }
};
