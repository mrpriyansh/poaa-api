const { ErrorHandler } = require('../../../services/handleError');
const { isNull, insertInstallment } = require('../../utils');

module.exports = async (req, res, next) => {
  try {
    const fields = ['name', 'accountNo', 'amount'];
    const body = { ...req.body, agentId: req.user.id };
    if (isNull(body, fields)) throw new ErrorHandler(400, 'Fields cannot be empty');
    if (body && body.installments <= 0)
      throw new ErrorHandler(422, 'Invalid number of installments');
    const response = await insertInstallment(body, next);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};
