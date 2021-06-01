const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const server = new http.Server();
const {pipeline} = require('stream');
const fsPromises = require('fs').promises;

server.on('request', async (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  switch (req.method) {
    case 'GET': {
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        return res.end();
      }

      const filepath = path.join(__dirname, 'files', pathname);

      try {
        await fsPromises.open(filepath, 'r');
      } catch (err) {
        res.statusCode = 404;
        return res.end('File not found');
      }

      return pipeline(fs.createReadStream(filepath), res, (err) => {
        if (err) {
          console.log(err);
          res.statusCode = 500;
          res.end('Not implemented');
        } else {
          res.statusCode = 200;
          res.end();
          console.log('File sent');
        }
      });
    }

    default:
      res.statusCode = 500;
      res.end('Not implemented');
  }
});

module.exports = server;
