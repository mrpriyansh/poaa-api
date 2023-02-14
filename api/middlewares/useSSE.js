const { v4: uuid } = require('uuid');

module.exports = (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // only if you want anyone to access this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.flushHeaders();

    const sendEventStreamData = (data, event = 'update', id = uuid()) => {
      const sseFormattedResponse = `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(sseFormattedResponse);
    };

    // we are attaching sendEventStreamData to res, so we can use it later
    Object.assign(res, {
      sendEventStreamData,
    });

    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
