const http = require('http');
const path = require('path');
const server = new http.Server();
const fsPromises = require('fs').promises;

server.on('request', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  switch (req.method) {
    case 'DELETE': {
      if (pathname.split('/').length > 1) {
        res.statusCode = 400;
        return res.end();
      }

      const filepath = path.join(__dirname, 'files', pathname);

      try {
        await fsPromises.open(filepath, 'r');
      } catch (err) {
        res.statusCode = 404;
        return res.end('File not exist');
      }
      await fsPromises.unlink(filepath);
      res.statusCode = 200;
      res.end('Deleted');
      break;
    }

    default:
      res.statusCode = 500;
      res.end('Not implemented');
  }
});

module.exports = server;
