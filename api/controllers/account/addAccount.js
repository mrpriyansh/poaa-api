const { isNull, insertAccount } = require('../../utils/index');
const { ErrorHandler } = require('../../../services/handleError');

module.exports = async (req, res, next) => {
  const fields = ['name', 'accountNo', 'accountType', 'amount', 'openingDate', 'maturityDate'];
  if (isNull(req.body, fields)) next(new ErrorHandler(400, 'Fields cannot be empty'));

  const response = await insertAccount(req.body, req.user.userId);
  next(response);
};
