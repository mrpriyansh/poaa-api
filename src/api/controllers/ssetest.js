module.exports = (req, res) => {
  const interval = setInterval(function generateAndSendRandomNumber() {
    const data = {
      value: Math.random(),
    };
    //     res.write(`data: ${JSON.stringify(data)}`);
    res.sendEventStreamData(data);
  }, 1000);

  // close
  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });
};
