const User = require('../../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id }, { password: 0 });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
