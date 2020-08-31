const { isNull } = require('../utils/index');
const { ErrorHandler } = require('../../services/handleError');
const Accounts = require('../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    const fields = ['name', 'accountno', 'accountType', 'amount', 'openingDate', 'maturityDate'];
    if (isNull(req.body, fields)) throw new ErrorHandler(400, 'Fields cannot be empty');
    await Accounts.findOneAndUpdate({ accountno: req.body.accountno }, req.body);
    res.json('Account Updated Successfully!');
  } catch (err) {
    next(err);
  }
};
