const updateBulkAslaas = require('../controllers/account/updateBulkAslaas');

process.on('message', function(msg) {
  const init = function() {
    updateBulkAslaas(msg);
  };
  init.bind(this)();
});

process.on('uncaughtException', function(err) {
  console.log(`Error happened: ${err.message}\n${err.stack}.\n`);
  console.log('Gracefully finish the routine.');
  process.send({ status: 'Failed' });
  process.disconnect();
});
