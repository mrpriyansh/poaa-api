const Account = require('../models/Accounts');

module.exports = async (req, res, next) => {
  try {
    const allAccounts = await Account.find().sort({accountno: 1});
    res.json(allAccounts);
  } catch (err) {
    next(err);
  }
};
