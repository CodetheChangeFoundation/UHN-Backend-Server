class ErrorFormat {
  constructor(message) {
    this.message = message;
  }
}

function badRequest(res, details, statusType) {
  res.status(400).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
   });
}

function unauthorized(res, details, statusType) {
  res.status(401).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

function internalServerError(res, details, statusType) {
  res.status(500).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

function notFound(res, details, statusType) {
  res.status(404).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

module.exports = {
  badRequest,
  unauthorized,
  internalServerError,
  notFound
};
