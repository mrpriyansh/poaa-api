const User = require('../../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $set: {
          ...req.body,
        },
      },
      { projection: { password: 0 }, new: true }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};
