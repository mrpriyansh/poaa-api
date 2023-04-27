const { ErrorHandler } = require('../../../services/handleError');
const Installment = require('../../models/Installment');
const List = require('../../models/List');
const { INSTALLMENT_PENDING, REFERENCE_NO_CREATED } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const records = await List.findOne({ _id: req.params.listId });
    if (!records) throw new ErrorHandler(400, "List doesn't exists");
    if (records.status === REFERENCE_NO_CREATED)
      throw new ErrorHandler(400, "Operation can't be performed");
    const bulkUpdate = records.list.reduce((acc, list) => {
      list.accounts.forEach(inst => {
        acc[inst.accountNo] = {
          ...inst,
          installments:
            ((acc[inst.accountNo] && acc[inst.accountNo].installments) || 0) +
            inst.paidInstallments,
        };
      });
      return acc;
    }, {});
    await Installment.bulkWrite(
      Object.keys(bulkUpdate).map(ele => ({
        updateOne: {
          filter: { accountNo: bulkUpdate[ele].accountNo },
          update: {
            $set: {
              accountNo: bulkUpdate[ele].accountNo,
              amount: bulkUpdate[ele].amount,
              agentId: req.user.id,
              installments: bulkUpdate[ele].installments,
              name: bulkUpdate[ele].name,
              status: INSTALLMENT_PENDING,
            },
          },
          upsert: true,
        },
      }))
    );

    await List.deleteOne({ _id: req.params.listId });

    res.json('Successfully');
  } catch (err) {
    next(err);
  }
};
