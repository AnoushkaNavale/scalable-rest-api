// src/utils/ApiResponse.js
// Every success response has the same shape so clients can write predictable code.
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data       = data;
    this.message    = message;
    this.success    = statusCode < 400;
  }
}

module.exports = ApiResponse;
