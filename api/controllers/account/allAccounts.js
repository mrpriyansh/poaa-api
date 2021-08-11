const Account = require('../../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    const agentDetails = { name: req.user.name, email: req.user.email };
    const allAccounts = await Account.find({ agentDetails }).sort({ maturityDate: 1 });
    res.json(allAccounts);
  } catch (err) {
    next(err);
  }
};
