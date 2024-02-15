import * as http from 'http';
import busboy from 'busboy';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { execSync } from 'child_process';
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync('index.html'));
    }
    else if (req.url === '/upload') {
        let filename = '';
        const bb = busboy({ headers: req.headers }); // 512MB file size limit
        const saveTo = uuidv4();
        const convertTo = uuidv4();
        let error = true;
        // TODO: use pipe instead of saving to disk
        console.log(`Request from ${req.socket.remoteAddress}`);
        bb.on('file', (name, file, info) => {
            try {
                filename = info.filename;
                filename = Buffer.from(filename, 'latin1').toString('utf8');
                const stream = fs.createWriteStream(path.resolve(path.join('share', saveTo)));
                file.pipe(stream);
            }
            catch (e) {
                console.error(e);
            }
        });
        bb.on('close', () => {
            try {
                // No real code injection here, we control the filename
                // TODO: Add file size limit
                execSync(`podman run --network none --rm -v ${path.resolve('share')}:/usr/data caj2pdf sh -c 'cd /usr/app/caj2pdf && ./caj2pdf convert /usr/data/${saveTo} -o /usr/data/${convertTo}'`);
                error = false;
            }
            catch (e) {
                console.error(e);
            }
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                fs.unlink(path.resolve(path.join('share', saveTo)), () => { });
                fs.unlink(path.resolve(path.join('share', convertTo)), () => { });
            }
            else {
                const stat = fs.statSync(path.join('share', convertTo));
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURI(decodeEntities(filename))}.pdf`,
                    'Content-Length': stat.size,
                });
                const readStream = fs.createReadStream(path.resolve(path.join('share', convertTo)));
                readStream.pipe(res);
                res.on('close', () => {
                    fs.unlink(path.resolve(path.join('share', saveTo)), () => { });
                    fs.unlink(path.resolve(path.join('share', convertTo)), () => { });
                });
            }
        });
        req.pipe(bb);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});
server.listen(5002, () => {
    console.log('Server listening on http://localhost:5002 ...');
});
