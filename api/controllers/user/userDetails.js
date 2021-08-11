const User = require('../../models/User');

module.exports = async (req, res, next) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
