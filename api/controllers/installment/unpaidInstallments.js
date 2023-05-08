const Installment = require('../../models/Installment');
const { INSTALLMENT_LOGGED } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const allInstallments = await Installment.find({
      agentId: req.user.id,
      $expr: [{ status: INSTALLMENT_LOGGED }, { $gt: ['updatedAt', currentMonth] }],
    }).sort({ name: 1 });
    res.json(allInstallments);
  } catch (err) {
    next(err);
  }
};
