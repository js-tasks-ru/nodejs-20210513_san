const stream = require('stream');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
  }

  _flush(callback) {
  }
}

module.exports = LineSplitStream;
