const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../../services/handleError');

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization || req.headers.authorization.split(' ').length <= 1) {
      throw new ErrorHandler(417, 'No token received!');
    }
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);
    req.user = decoded.user_data;
    next();
  } catch (err) {
    next(err);
  }
};
