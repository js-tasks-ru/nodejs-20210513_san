const fs = require('fs');
const fsPromises = fs.promises;
// const url = require('url');
const http = require('http');
const path = require('path');
// const fsPromisify = fs.promises;
const {pipeline} = require('stream');
const LimitSizeStream = require('./LimitSizeStream');
// const {finished} = require('stream');
// const os = require('os');

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  if (pathname.split('/').length > 1) {
    res.statusCode = 400;
    return res.end();
  }

  const filepath = path.join(__dirname, 'files', pathname);

  try {
    const result = await fsPromises.open(filepath, 'r');
    if (result) {
      res.statusCode = 409;
      return res.end('File already exist');
    }
  } catch (err) {
    // console.log(err);
  }

  pipeline(
      req,
      new LimitSizeStream({limit: 1000000}),
      fs.createWriteStream(filepath, {encoding: 'utf-8'}),
      (err, data) => {
        if (err) {
          if (err.code === 'LIMIT_EXCEEDED') {
            console.log('inside');
            res.statusCode = 413;
            res.end();
          }
          fs.unlink(filepath, (err) => console.log(err));
          res.statusCode = 500;
          return res.end();
        } else {
          console.log('done');
          res.statusCode = 201;
          res.end();
        }
      },
  );
});

module.exports = server;

// finished(limitSizeStream, (err) => {
//   if (err) {
//     fs.unlink(filepath, err => console.log(err))
//     res.statusCode = 413;
//     return res.end();
//   } else {
//     console.log("");
//   }
// });
//
// req.on("error", err => {
//   fs.unlink(filepath, err => console.log(err))
// })
