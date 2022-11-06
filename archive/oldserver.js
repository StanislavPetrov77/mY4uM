const path = require('path');
const http = require('http');
var fs = require('fs');

const server = http.createServer(function(req, res) {
console.log(req.url);    
if (req.url === '/') {

        fs.readFile(__dirname + '/public/index.html', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
          });
    }
  
    else if (req.url === '/style.css') {
        fs.readFile(__dirname + '/public/css/style.css', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.write(data);
            res.end();
        });
    }

    else if(req.url === '/script.js') {
        fs.readFile(__dirname + '/public/js/script.js', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.write(data);
            res.end();
        });
    }

    else if (req.url === '/login.html') {
        fs.readFile(__dirname + '/public/login.html', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
    }

    else if (req.url === '/assets/img_temp/img2.jpg') {
        fs.readFile(__dirname + '/public/assets/img_temp/img2.jpg', function (err, data) {
            if (err) console.log(err);
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            res.write(data);
            res.end();
        });
    }

    else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(5000);