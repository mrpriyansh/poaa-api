const { ObjectId } = require('mongoose').Types;
const Installment = require('../../models/Installment');
const { ErrorHandler } = require('../../../services/handleError');

const List = require('../../models/List');
const {
  INSTALLMENT_PENDING,
  LIST_LIMIT,
  INSTALLMENT_LIST_CREATED,
} = require('../../utils/constants');

module.exports = async (req, res, next) => {
  const session = await Installment.startSession();
  session.startTransaction();
  try {
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
    let cur = 0;
    let listNo = 0;
    installments.forEach(inst => {
      let remaining = inst.total;
      let currentInst = inst.installments;
      while (remaining > 0) {
        if (cur < inst.amount) {
          listNo += 1;
          cur = LIST_LIMIT;
        }
        const payableInst = Math.min(Math.floor(cur / inst.amount), currentInst);

        if (list.length < listNo) {
          list.push({ accounts: [], totalAmount: 0, count: 0 });
        }

        list[listNo - 1].accounts.push({
          paidInstallments: payableInst,
          accountno: inst.accountno,
          name: inst.name,
          amount: inst.amount,
          totalAmount: inst.amount * payableInst,
        });
        list[listNo - 1].totalAmount += inst.amount * payableInst;
        list[listNo - 1].count += 1;

        cur -= payableInst * inst.amount;
        remaining -= payableInst * inst.amount;
        currentInst -= payableInst;
      }
    });

    await Installment.updateMany(
      {
        status: INSTALLMENT_PENDING,
        agentId: ObjectId(req.user.id),
      },
      { status: INSTALLMENT_LIST_CREATED }
    ).session(session);

    await List.create([{ list }], { session });
    await session.commitTransaction();

    res.json('Listed Generated Successfully');
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
