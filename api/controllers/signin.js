const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { ErrorHandler } = require('../../services/handleError');
const { jwtKey } = require('../../config/config');

const handleSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ErrorHandler(400, 'Fields Cannot by empty');
    const user = await User.findOne({ email });
    if (!user) throw new ErrorHandler(401, "User doesn't exists");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ErrorHandler(401, 'Incorrect Password');
    const payload = { email: user.email };
    const token = jwt.sign(payload, jwtKey, {
      expiresIn: '30d',
    });
    res.status(200).json(token);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = handleSignin;
