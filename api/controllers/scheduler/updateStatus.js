/* eslint-disable consistent-return */
const Task = require('../../models/Task');

const utilFunction = async function(id, res) {
  const task = await Task.findOne({ _id: id });
  if (task && task.status !== 'Running' && task.status !== 'Initiated') {
    res.sendEventStreamData(task, 'close');
    return res.end();
  }

  res.sendEventStreamData(task, 'update');
};
module.exports = async function(req, res, next) {
  try {
    utilFunction(req.query.id, res);

    const interval = setInterval(async function generateAndSendRandomNumber() {
      await utilFunction(req.query.id, res);
    }, 5000);

    // close
    res.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error) {
    res.end();
    next(error);
  }
};
