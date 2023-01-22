const Task = require('../../models/Task');

module.exports = async (req, res, next) => {
  try {
    const { id, processIds } = req.body;
    processIds.forEach(pid => {
      try {
        process.kill(pid);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });
    await Task.updateOne({ _id: id }, { status: 'Aborted', error: 'Aborted by you' });
    res.json('Aborted!!!');
  } catch (err) {
    next(err);
  }
};
