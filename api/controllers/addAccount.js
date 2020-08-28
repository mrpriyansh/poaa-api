const { isNull, insertAccount } = require('../utils/index');
const { ErrorHandler } = require('../../services/handleError');

module.exports = async (req, res, next) => {
  if (isNull(req.body)) next(new ErrorHandler(400, 'Fields cannot be empty'));
  const response = await insertAccount(req.body);
  next(response);
};
