const Installment = require('../../models/Installment');
const { INSTALLMENT_LOGGED, INSTALLMENT_PENDING } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const allInstallments = await Installment.find({
      agentId: req.user.id,

      $expr: {
        $not: {
          $and: [
            { $gt: ['$updatedAt', currentMonth] },
            {
              $or: [
                { $eq: ['$status', INSTALLMENT_LOGGED] },
                { $eq: ['$status', INSTALLMENT_PENDING] },
              ],
            },
          ],
        },
      },
    }).sort({ name: 1 });
    console.log(allInstallments.length);
    res.json(allInstallments);
  } catch (err) {
    next(err);
  }
};
