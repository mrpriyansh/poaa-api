import type { Request, Response, NextFunction } from 'express';

class ErrorHandler extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

const handleError = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction // Required for Express middleware
): void => {
  const { statusCode, message } = err;

  console.log(message);
  if (Number.isInteger(statusCode)) {
    res.status(statusCode).json({ message });
  } else {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { ErrorHandler, handleError };
