const List = require('../../models/List');

module.exports = async (req, res, next) => {
  try {
    const lists = await List.find({ agentId: req.user.id })
      .sort({ _id: -1 })
      .limit(15);
    res.json(lists);
  } catch (err) {
    next(err);
  }
};
