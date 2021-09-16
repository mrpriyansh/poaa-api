const { ObjectId } = require('mongoose').Types;
const Account = require('../../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    const agentId = new ObjectId(req.user.id);
    const allAccounts = await Account.find({ agentId }).sort({ maturityDate: 1 });
    res.json(allAccounts);
  } catch (err) {
    next(err);
  }
};
