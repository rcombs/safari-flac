#! /usr/bin/env node

const http = require('http'),
      fs   = require('fs');

const header = fs.readFileSync(__dirname + '/header.flac');
const chunk = fs.readFileSync(__dirname + '/chunk.flac');

var server = http.createServer((req, res) => {
  if (req.url == '/') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<audio src="/audio.flac" controls autoplay></audio>');
  } else if (req.url == '/audio.flac') {
    res.setHeader('Content-Type', 'audio/flac');
    res.setHeader('Accept-Ranges', 'bytes');
    var bytesLeft = 1024 * 1024 * 1024;
    var range = req.headers.range;
      console.log(range);
    if (range)
      range = range.match(/bytes=(\d+)-(\d+)/);
    if (range) {
      res.setHeader('Content-Range', 'bytes ' + range[1] + '-' + range[2] + '/' + bytesLeft);
      bytesLeft = parseInt(range[2]) + 1;
    }
    res.setHeader('Content-Length', bytesLeft);
    var cb = () => {
      setTimeout(() => { writeChunk(chunk); }, 100);
    };
    var writeChunk = (data) => {
      if (bytesLeft < data.length) {
        res.end(data.slice(0, bytesLeft));
      } else {
        bytesLeft -= data.length;
        res.write(data, cb);
      }
    };
    writeChunk(header);
  } else {
    console.log('bad request: ' + req.url);
    res.writeHead(404);
    res.end();
  }
});

server.listen(8989);
