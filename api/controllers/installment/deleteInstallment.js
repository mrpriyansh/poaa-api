const { ErrorHandler } = require('../../../services/handleError');
const Installment = require('../../models/Installment');
const { INSTALLMENT_PENDING } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    if (!req.body.accountno) throw new ErrorHandler(400, 'Account number is required');
    await Installment.deleteOne({
      accountno: req.body.accountno,
      status: INSTALLMENT_PENDING,
    });
    res.json('Installment Deleted Successfully!');
  } catch (err) {
    next(err);
  }
};
