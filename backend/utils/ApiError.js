class ApiError extends Error {
    /**
     * Create custom API error
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode || 500;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ApiError;