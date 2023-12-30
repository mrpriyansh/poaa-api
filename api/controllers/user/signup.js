const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { ErrorHandler } = require('../../../services/handleError');

const handleSignUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ErrorHandler(400, 'Fields Cannot be empty');
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new ErrorHandler(409, 'Email already Exists');

    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash });
    res.status(200).json({ icon: 'success', title: 'Account Created Successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = handleSignUp;
