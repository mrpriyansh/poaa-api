const { ErrorHandler } = require('../../../services/handleError');
const Installment = require('../../models/Installment');
const { isNull } = require('../../utils');
const { INSTALLMENT_PENDING } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const fields = ['name', 'accountno', 'amount'];
    const body = { ...req.body, agentId: req.user.id };
    if (isNull(body, fields)) throw new ErrorHandler(400, 'Fields cannot be empty');
    if (body && body.installments <= 0)
      throw new ErrorHandler(422, 'Invalid number of installments');
    await Installment.findOneAndUpdate(
      { accountno: body.accountno, status: INSTALLMENT_PENDING },
      body
    );
    res.json('Installment updated successfully');
  } catch (err) {
    next(err);
  }
};
