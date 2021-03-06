const { isNull, insertAccount } = require('../utils/index');
const { ErrorHandler } = require('../../services/handleError');

module.exports = async (req, res, next) => {
  const fields = ['name', 'accountno', 'accountType', 'amount', 'openingDate', 'maturityDate'];
  const agentDetails = { name: req.user.name, email: req.user.email };
  if (isNull(req.body, fields)) next(new ErrorHandler(400, 'Fields cannot be empty'));
  const response = await insertAccount(req.body, agentDetails);
  next(response);
};
