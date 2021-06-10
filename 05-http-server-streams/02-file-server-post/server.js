const fs = require('fs');
const http = require('http');
const path = require('path');
const fsPromises = fs.promises;
const server = new http.Server();
const LimitSizeStream = require('./LimitSizeStream');

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

      const handleError = (err) => {
        if (err) {
          fs.unlink(filepath, (err) => console.log());

          if (err.code === 'LIMIT_EXCEEDED') {
            res.statusCode = 413;
            req.destroy();
            writableStream.destroy();
          } else {
            res.statusCode = 500;
          }

          return res.end();
        }

        res.statusCode = 201;
        res.end();
      };

      const writableStream = fs.createWriteStream(filepath, {
        encoding: 'utf-8',
        emitClose: true,
      });
      const limitSizeStream = new LimitSizeStream({limit: 1000000});

      req.on('error', handleError);
      req.on('close', () => {
        console.log('req closed ===================================');
      });
      writableStream.on('error', handleError);

      req.on('readable', function() {
        let chunk = req.read();
        while (null !== chunk) {
          // console.log(`Received ${chunk.length} bytes of data.`);
          limitSizeStream._transform(chunk, 'utf-8', handleError);
          writableStream.write(chunk);
          chunk = req.read();
        }
      });

      break;
    }

    default:
      res.statusCode = 500;
      res.end('Not implemented');
  }
});

module.exports = server;
