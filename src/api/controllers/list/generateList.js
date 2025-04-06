const { ObjectId } = require('mongoose').Types;
const Installment = require('../../models/Installment');
const { ErrorHandler } = require('../../../services/handleError');
const dbTransactionWrapper = require('../../utils/dbTransactionWrapper');

const List = require('../../models/List');
const {
  INSTALLMENT_PENDING,
  LIST_LIMIT,
  LIST_CREATED,
  INSTALLMENT_LOGGED,
} = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    await dbTransactionWrapper(async session => {
      const installments = await Installment.aggregate([
        {
          $match: {
            status: INSTALLMENT_PENDING,
            agentId: ObjectId(req.user.id),
          },
        },
        {
          $project: {
            status: 0,
          },
        },
        {
          $addFields: {
            total: {
              $multiply: ['$installments', '$amount'],
            },
          },
        },
        {
          $sort: {
            total: -1,
            amount: -1,
          },
        },
      ]).session(session);

      if (installments.length === 0) {
        throw new ErrorHandler(400, 'No installments found');
      }

      const list = [];
      let curListRemaining = 0;
      let listNo = 0;
      installments.forEach(inst => {
        let remainingAmount = inst.total;
        let remainingInstallment = inst.installments;
        while (remainingAmount > 0) {
          let ind = 0;
          while (ind < listNo && remainingAmount > 0) {
            const available = LIST_LIMIT - list[ind].totalAmount;
            if (available >= remainingAmount) {
              const payableInst = Math.min(
                Math.floor(available / inst.amount),
                remainingInstallment
              );
              list[ind].accounts.push({
                paidInstallments: payableInst,
                accountNo: inst.accountNo,
                name: inst.name,
                amount: inst.amount,
                totalAmount: inst.amount * payableInst,
              });
              list[ind].totalAmount += inst.amount * payableInst;
              list[ind].count += 1;
              remainingAmount -= payableInst * inst.amount;
              remainingInstallment -= payableInst;
              if (ind === listNo - 1) curListRemaining -= payableInst * inst.amount;
            }
            ind += 1;
          }
          if (remainingAmount > 0) {
            if (
              // curListRemaining < inst.amount ||
              curListRemaining < remainingAmount
              // && inst.total < LIST_LIMIT
            ) {
              listNo += 1;
              curListRemaining = LIST_LIMIT;
            }
            const payableInst = Math.min(
              Math.floor(curListRemaining / inst.amount),
              remainingInstallment
            );
            if (list.length < listNo) {
              list.push({ accounts: [], totalAmount: 0, count: 0 });
            }
            list[listNo - 1].accounts.push({
              paidInstallments: payableInst,
              accountNo: inst.accountNo,
              name: inst.name,
              amount: inst.amount,
              totalAmount: inst.amount * payableInst,
            });
            list[listNo - 1].totalAmount += inst.amount * payableInst;
            list[listNo - 1].count += 1;
            curListRemaining -= payableInst * inst.amount;
            remainingAmount -= payableInst * inst.amount;
            remainingInstallment -= payableInst;
          }
        }
      });

      await Installment.updateMany(
        {
          status: INSTALLMENT_PENDING,
          agentId: ObjectId(req.user.id),
        },
        { status: INSTALLMENT_LOGGED }
      ).session(session);

      await List.create([{ list, status: LIST_CREATED, agentId: req.user.id }], { session });
    });
    res.json('Listed Generated Successfully');
  } catch (err) {
    next(err);
  }
};
