const childProcess = require('child_process');
const Task = require('../../models/Task');

module.exports = async (req, res, next) => {
  let gTask = null;
  let gTaskProcessor = null;
  try {
    const task = await Task.create({
      status: 'Initiated',
      type: req.params.type,
      progress: 'List generation on portal is inititated.',
    });
    gTask = task;

    const taskProcessor = childProcess.fork('./api/controllers/scheduler/worker.js');
    gTaskProcessor = taskProcessor;

    taskProcessor.on('message', async function(payload) {
      try {
        if (payload.error) {
          await Task.updateOne(
            { _id: task._id },
            { $set: { status: 'Failed', error: payload.error } }
          );
          taskProcessor.kill();
        } else {
          await Task.updateOne({ _id: task._id }, { $set: { ...payload } });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });

    taskProcessor.on('close', function() {
      this.kill();
    });

    const params = {
      payload: req.body,
      type: req.params.type,
      userDetails: req.user,
      taskId: task._id,
    };

    taskProcessor.send(params);
    res.status(202).json({ taskId: task._id });
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
