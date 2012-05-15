var app = require('./config')
  , path = require('path')
  , url = require('url')
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(3000);

var client = null
  , device = null;

io.sockets.on('connection', function (socket) {
  socket.on('set-role', function(role) {
    console.log('set role ' + role);
    if (client == null || device == null) {
      if (role == 'client') { client = socket; console.log('client connected'); }
      else { device = socket; console.log('device connected'); }
      if (client != null && device != null) run();
    }
  });
});

function run() {
  console.log('both client and device are connected');
  client.on('get-current-position', function (opts) {
    device.emit('get-current-position', opts, function(data) {
      console.log('got-current-position with data: ' + JSON.stringify(data));
    });
  });

  client.on('capture-image', function (opts) {
    device.emit('capture-image', opts, function(data) {
      console.log('captured-image with data: ' + JSON.stringify(data));
    });
  });
}

function handler(req, res) {
  var uri = url.parse(req.url).pathname
    , filename = path.join(process.cwd(), uri);


 
  path.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }

      res.writeHead(200);
      res.write(file, "binary");
      res.end();
    });
  });

}
