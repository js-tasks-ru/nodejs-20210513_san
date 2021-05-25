const stream = require("stream");
const os = require("os");

class LineSplitStream extends stream.Transform {
  #data = "";
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const string = chunk.toString();
    this.#data += string;

    const arr = this.#data.split(os.EOL);

    if (arr.length > 1) {
      const lastStrPart = arr[arr.length - 1];

      arr.forEach((str, idx) => {
        if (str && idx < arr.length - 2) this.push(str);

        if (str && idx === arr.length - 2) {
          this.push(str);

          if (!lastStrPart) {
            this.#data = "";
          } else {
            this.#data = lastStrPart;
          }
        }
      });
    }

    callback();
  }

  _flush(callback) {
    this.push(this.#data);
    callback();
  }
}

module.exports = LineSplitStream;
