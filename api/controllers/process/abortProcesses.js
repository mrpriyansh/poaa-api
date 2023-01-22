const Task = require('../../models/Task');

module.exports = async (req, res, next) => {
  try {
    const { id, processIds } = req.body;
    // eslint-disable-next-line
    for await (const pid of processIds) {
      try {
        await process.kill(pid);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    }
    await Task.updateOne({ _id: id }, { status: 'Aborted', error: 'Aborted by you' });
    res.json('Aborted!!!');
  } catch (err) {
    next(err);
  }
};
