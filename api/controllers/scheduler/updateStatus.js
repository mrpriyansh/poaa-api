/* eslint-disable consistent-return */
const Task = require('../../models/Task');

module.exports = async function(req, res) {
  try {
    const task1 = await Task.findOne({ _id: req.query.id });
    if (task1.status !== 'Running' && task1.status !== 'Initiated') {
      res.sendEventStreamData(task1, 'close');
      return res.end();
    }

    res.sendEventStreamData(task1, 'update');

    const interval = setInterval(async function generateAndSendRandomNumber() {
      const task = await Task.findOne({ _id: req.query.id });
      if (task.status !== 'Running' && task.status !== 'Initiated') {
        res.sendEventStreamData(task, 'close');
        return res.end();
      }
      res.sendEventStreamData(task, 'update');
    }, 5000);

    // close
    res.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
