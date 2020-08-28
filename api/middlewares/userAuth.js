const jwt = require('jsonwebtoken');
const { jwtKey } = require('../../config/config');
const { ErrorHandler } = require('../../services/handleError');

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization || req.headers.authorization.split(' ').length <= 1) {
      throw new ErrorHandler(417, 'No token received!');
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, jwtKey, (error, decoded) => {
      if (error) throw new ErrorHandler(498, 'Token is invalid');
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};
