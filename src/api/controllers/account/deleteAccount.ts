const { ErrorHandler } = require('../../../services/handleError');
const Accounts = require('../../models/Accounts');
const Installment = require('../../models/Installment');
const dbTransactionWrapper = require('../../utils/dbTransactionWrapper');

module.exports = async (req, res, next) => {
  try {
    if (!req.body.accountNo) throw new ErrorHandler(400, 'Account Number is required');

    await dbTransactionWrapper(async (session) => {
      await Installment.deleteOne({ accountNo: req.body.accountNo }).session(session);
      await Accounts.deleteOne({ accountNo: req.body.accountNo }).session(session);
    });
    res.json('Account Deleted Successfully!');
  } catch (err) {
    next(err);
  }
};
