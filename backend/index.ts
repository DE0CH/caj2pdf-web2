import * as http from 'http';
import busboy from 'busboy';
import * as fs from 'fs';
import tempfile from 'tempfile';
import { execSync } from 'child_process';

function decodeEntities(encodedString: string) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate: Record<string, string> = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('index.html'));
  } else if (req.url === '/upload') {
    let filename = '';
    const bb = busboy({ headers: req.headers}); // 512MB file size limit
    const saveTo = tempfile();
    const convertTo = tempfile();
    let error = true;
    // TODO: use pipe instead of saving to disk
    console.log(`Request from ${req.socket.remoteAddress}`);
    bb.on('file', (name, file, info) => {
      try {
        filename = info.filename;
        const stream = fs.createWriteStream(saveTo)
        file.pipe(stream);
      } catch (e) {
        console.error(e);
      }
    });
    bb.on('close', () => {
      try {
        // No real code injection here, we control the filename
        execSync(`./caj2pdf convert ${saveTo} -o ${convertTo}`, { cwd: '../caj2pdf' });
        error = false;
      }
      catch (e) {
        console.error(e);
      }
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        const stat = fs.statSync(convertTo);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURI(decodeEntities(filename))}.pdf`,
          'Content-Length': stat.size,
        });
        const readStream = fs.createReadStream(convertTo);
        readStream.pipe(res);
        res.on('close', () => {
          // fs.unlink(saveTo, () => {});
          // fs.unlink(convertTo, () => {});
        });
      }
    });
    req.pipe(bb);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(5002, () => {
  console.log('Server listening on http://localhost:5002 ...');
});
