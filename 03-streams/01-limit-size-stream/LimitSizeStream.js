const stream = require("stream");
const LimitExceededError = require("./LimitExceededError");

class LimitSizeStream extends stream.Transform {
  #limit = 0;
  #size = 0;

  constructor(options) {
    super(options);
    this.#limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    const length = Buffer.byteLength(chunk, "utf-8");
    if (this.#size + length > this.#limit)
      return callback(new LimitExceededError());
    //
    this.#size += length;
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
