var app = require('./config')
  , path = require('path')
  , url = require('url')
  , io = require('socket.io').listen(app)
  , fs = require('fs');

var client = null
  , device = null
  , port = process.env.PORT || 3000;

app.post('/', function(req, res, next) {
    console.log('start upload');
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    req.form.complete(function(err, fields, files) {
        console.log('complete upload');
        if (err) 
          next(err)
        else {
          res.writeHead(200, {});
          res.end();
        }
    })
})

app.listen(port);

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

  client.on('disconnect', function() { client = null });
  device.on('disconnect', function() { device = null });
}
