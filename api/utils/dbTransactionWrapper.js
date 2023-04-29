const { default: mongoose } = require('mongoose');

module.exports = async callback => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await callback(session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
