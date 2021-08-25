const List = require('../../models/List');

module.exports = async (req, res, next) => {
  try {
    const lists = await List.find()
      .sort({ _id: -1 })
      .limit(10);
    res.json(lists);
  } catch (err) {
    next(err);
  }
};
