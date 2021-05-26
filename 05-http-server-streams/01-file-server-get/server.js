const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");
const server = new http.Server();
const { pipeline } = require("stream");

server.on("request", (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (pathname.split("/").length > 1) {
    res.statusCode = 400;
    return res.end();
  }

  const filepath = path.join(__dirname, "files", pathname);

  fs.access(filepath, fs.F_OK, (err) => {
    if (err) {
      res.statusCode = 404;
      return res.end("File not found!");
    }

    pipeline(fs.createReadStream(filepath), res, (err) => {
      if (err) {
        res.statusCode = 500;
        res.end("Not implemented");
      } else {
        console.log("File sent");
      }
    });
  });
});

module.exports = server;
