import * as http from 'http';
import busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <form action="/upload" enctype="multipart/form-data" method="post">
        <input type="file" name="someCoolFiles"><br>
        <button>Upload</button>
      </form>
    `);
  } else if (req.url === '/upload') {
    let filename = '';
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
      filename = info.filename;
      const saveTo = path.join(__dirname, filename);
      file.pipe(fs.createWriteStream(saveTo));
    });
    bb.on('close', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`upload success: ${filename}`);
    });
    req.pipe(bb);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
});

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000 ...');
});
