class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, req, res) => {
  const { statusCode, message } = err;
  if (Number.isInteger(statusCode)) {
    res.status(statusCode).json(message);
  } else {
    res.status(500).json('Server Error');
  }
};

module.exports = { ErrorHandler, handleError };
