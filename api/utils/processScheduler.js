const childProcess = require('child_process');
const Task = require('../models/Task');

module.exports = async (req, res, next) => {
  let gTask = null;
  let gTaskProcessor = null;
  try {
    const task = await Task.create({ status: 'Initiated', type: req.params.type });
    gTask = task;

    const taskProcessor = childProcess.fork('./api/utils/worker.js');
    gTaskProcessor = taskProcessor;

    taskProcessor.on('message', async function(payload) {
      try {
        if (payload.error) {
          await Task.updateOne(
            { _id: task._id },
            { $set: { status: 'FAILED', error: payload.error } }
          );
          taskProcessor.kill();
        } else {
          await Task.updateOne({ _id: task._id }, { $set: { ...payload } });
        }
      } catch (err) {
        console.log(err);
      }
    });

    taskProcessor.on('close', function() {
      console.log('killing');
      this.kill();
    });

    const params = req.body;

    taskProcessor.send(params);
    res.status(202).json(task);
  } catch (err) {
    if (gTask) {
      await Task.updateOne(
        { _id: gTask._id },
        { $set: { status: 'INITITATION_FAILED', error: err.message } }
      );
    }
    if (gTaskProcessor) {
      gTaskProcessor.kill();
    }
    next(err);
  }
};
