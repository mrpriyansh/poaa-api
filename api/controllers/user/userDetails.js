const User = require('../../models/User');

module.exports = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email }, { password: 0 });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
