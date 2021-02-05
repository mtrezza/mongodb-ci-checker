class Errors extends Error {

  /**
   * Creates a custom error.
   * @param {String} message The error message.
   */
  static customError(message) {
    return new Error(message);
  }

  /**
   * The preset errors.
   */
  static get Error() {
    return Object.freeze({
      invalidConfig: new Error('mongodb-ci-checker: config invalid.'),
    });
  }
}

module.exports = Errors;
