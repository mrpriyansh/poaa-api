const childProcess = require('child_process');
const Task = require('../models/Task');

module.exports = async (req, res, next) => {
  //   console.log(req.body);
  let gTask = null;
  let gTaskProcessor = null;
  try {
    const task = await Task.create({ status: 'Initiated', type: req.params.type });
    gTask = task;

    const taskProcessor = childProcess.fork('./api/utils/worker.js');
    gTaskProcessor = taskProcessor;

    taskProcessor.on('message', function(payload) {
      console.log(payload);
      if (payload.error) {
        task.status = 'FAILED';
        task.error = payload.error;
        console.log(payload);
        task.save();
        taskProcessor.kill();
      } else {
        Object.keys(payload).forEach(ele => {
          task[ele] = payload[ele];
        });
        task.save();
      }
    });

    taskProcessor.on('close', function() {
      console.log('killing');
      this.kill();
    });

    const params = req.body;

    taskProcessor.send(params);
    res.status(201).json(task);
  } catch (err) {
    if (gTask) {
      gTask.status = 'Inititation Failed';
      gTask.error = err.message;
      gTask.save();
    }
    if (gTaskProcessor) {
      gTaskProcessor.kill();
    }
    next(err);
  }
};
