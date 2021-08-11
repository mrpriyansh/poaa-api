const Installment = require('../../models/Installment');
const { INSTALLMENT_PENDING } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const allInstallments = await Installment.find({
      agentId: req.user.id,
      status: INSTALLMENT_PENDING,
    });
    res.json(allInstallments);
  } catch (err) {
    next(err);
  }
};
