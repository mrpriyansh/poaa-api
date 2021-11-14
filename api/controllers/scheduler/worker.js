const updateBulkAslaas = require('../account/updateBulkAslaas');
const createList = require('../list/createList');

process.on('message', function(msg) {
  const init = function() {
    if (msg.type === 'update-aslaas') updateBulkAslaas(msg.payload, msg.userDetails, msg.taskId);
    else if (msg.type === 'create-list') createList(msg.payload.id, msg.userDetails, msg.taskId);
  };
  init.bind(this)();
});

process.on('uncaughtException', function(err) {
  process.send({ error: err.message });
  process.disconnect();
});
