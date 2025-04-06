const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { ErrorHandler } = require('../../../services/handleError');

const handleSignUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      throw new ErrorHandler(400, 'Fields Cannot be empty');
    }

    const loweredCaseEmail = email.toLowerCase();

    const exists = await User.findOne({ email: loweredCaseEmail });
    if (exists) throw new ErrorHandler(409, 'Email already Exists');

    const hash = await bcrypt.hash(password, 10);
    await User.create({ email: loweredCaseEmail, password: hash, name });
    res.status(200).json({ icon: 'success', title: 'Account Created Successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = handleSignUp;
