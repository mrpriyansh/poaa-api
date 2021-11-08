module.exports = (req, res, next) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // only if you want anyone to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.flushHeaders();

  const sendEventStreamData = (data, id) => {
    // const sseFormattedResponse = `event: userConnect\n data: ${JSON.stringify(data)}\n\n`;
    const sseFormattedResponse = `id: ${String(id)}\n\ndata: ${JSON.stringify(data)}\n\n}`;
    // 'id: ' + String(id) + '\n\n' + 'data: ' + JSON.stringify(data) + '\n\n';
    console.log(sseFormattedResponse);
    res.write(sseFormattedResponse);
  };

  // we are attaching sendEventStreamData to res, so we can use it later
  Object.assign(res, {
    sendEventStreamData,
  });

  next();
};
