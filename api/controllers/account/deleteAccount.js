const { ErrorHandler } = require('../../../services/handleError');
const Accounts = require('../../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    if (!req.body.accountNo) throw new ErrorHandler(400, 'Account Number is required');
    await Accounts.deleteOne({ accountNo: req.body.accountNo });
    res.json('Account Deleted Successfully!');
  } catch (err) {
    next(err);
  }
};
