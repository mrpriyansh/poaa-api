const Account = require('../../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    const allAccounts = await Account.find({ agentId: req.user.id }).sort({ maturityDate: 1 });
    res.json(allAccounts);
  } catch (err) {
    next(err);
  }
};
