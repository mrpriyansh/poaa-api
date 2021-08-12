const { ObjectId } = require('mongoose').Types;
const Installment = require('../../models/Installment');
const { INSTALLMENT_PENDING, LIST_LIMIT } = require('../../utils/constants');

module.exports = async (req, res, next) => {
  try {
    const curDate = new Date();
    const installments = await Installment.aggregate([
      {
        $match: {
          status: INSTALLMENT_PENDING,
          agentId: ObjectId(req.user.id),
        },
      },
      {
        $project: {
          name: 0,
          accountno: 0,
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
    ]);

    const list = {};
    let cur = 0;
    let listNo = 0;
    installments.forEach(inst => {
      let remaining = inst.total;
      list[inst._id] = [];
      while (remaining > 0) {
        if (cur < inst.amount) {
          listNo += 1;
          cur = LIST_LIMIT;
        }
        const payableInst = Math.min(Math.floor(cur / inst.amount), inst.installments);
        list[inst._id].push({
          no: listNo,
          installments: payableInst,
        });
        cur -= payableInst * inst.amount;
        remaining -= payableInst * inst.amount;
      }
    });

    const trans = installments.map(doc => {
      return {
        updateOne: {
          filter: { _id: ObjectId(doc._id) },
          update: { $set: { lists: list[doc._id], listedOn: curDate } },
        },
      };
    });
    await Installment.bulkWrite(trans, { ordered: false });
    res.json('Listed Generated Successfully');
  } catch (err) {
    next(err);
  }
};
