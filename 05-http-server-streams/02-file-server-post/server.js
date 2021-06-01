const fs = require('fs');
const http = require('http');
const path = require('path');
const fsPromises = fs.promises;
const {pipeline} = require('stream');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  switch (req.method) {
    case 'POST': {
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

      return pipeline(
          req,
          new LimitSizeStream({limit: 1000000}),
          fs.createWriteStream(filepath, {encoding: 'utf-8'}),
          (err, data) => {
            if (err) {
              if (err.code === 'LIMIT_EXCEEDED') {
                res.statusCode = 413;
                return res.end();
              }
              fs.unlink(filepath, (err) => console.log(err));
              res.statusCode = 500;
              return res.end();
            } else {
              res.statusCode = 201;
              res.end();
            }
          },
      );
    }

    default:
      res.statusCode = 500;
      res.end('Not implemented');
  }
});

module.exports = server;
