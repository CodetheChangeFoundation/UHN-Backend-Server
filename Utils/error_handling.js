function badRequest(res, details) {
  res.status(400).json({
    "message": "Bad Request",
    "details": details
  });
}

function unauthorized(res, details) {
  console.log("Failed to authorize");
  res.status(401).json({
    "message": "Unauthorized",
    "details": details
  })
}

function internalServerError(res, details) {
  res.status(500).json({
    "message": "Internal Server Error",
    "details": details
  });
}

function notFound(res, details) {
  res.status(404).json({
    "message": "Not Found",
    "details": details
  });
}

module.exports = {
  badRequest, unauthorized, internalServerError, notFound
}
