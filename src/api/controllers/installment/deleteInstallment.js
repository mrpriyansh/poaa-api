const { ErrorHandler } = require('../../../services/handleError');
const Installment = require('../../models/Installment');
const { INSTALLMENT_PENDING } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    if (!req.body.accountNo) throw new ErrorHandler(400, 'Account number is required');
    const exists = await Installment.findOneAndDelete({
      accountNo: req.body.accountNo,
      status: INSTALLMENT_PENDING,
    });
    if (!exists) throw new ErrorHandler(400, `Pending Installment doesn't exists!`);
    res.json('Installment Deleted Successfully!');
  } catch (err) {
    next(err);
  }
};
