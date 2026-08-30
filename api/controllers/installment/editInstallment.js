const { ErrorHandler } = require('../../../services/handleError');
const Installment = require('../../models/Installment');
const { isNull } = require('../../utils');
const { INSTALLMENT_PENDING, PAYMENT_MODES } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const fields = ['name', 'accountNo', 'amount'];
    const body = { ...req.body, agentId: req.user.id };
    if (isNull(body, fields)) throw new ErrorHandler(400, 'Fields cannot be empty');
    if (body && body.installments <= 0)
      throw new ErrorHandler(422, 'Invalid number of installments');

    if (body.payMode === PAYMENT_MODES.DOP_CHEQUE) {
      if (!body.chequeNo || !body.chequeNo.trim()) {
        throw new ErrorHandler(422, 'Cheque number is required for DOP Cheque payment');
      }
      if (!body.chequeAccNo || !/^\d{10}(\d{2})?$/.test(body.chequeAccNo.trim())) {
        throw new ErrorHandler(422, 'Cheque account number must be 10 or 12 digits');
      }
    }

    await Installment.findOneAndUpdate(
      { accountNo: body.accountNo, status: INSTALLMENT_PENDING },
      body
    );
    res.json('Installment updated successfully');
  } catch (err) {
    next(err);
  }
};
