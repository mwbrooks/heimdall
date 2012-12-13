var app = require('./config')
  , path = require('path')
  , url = require('url')
  , io = require('socket.io').listen(app)
  , fs = require('fs')

var client = null
  , device = null
  , port = process.env.PORT || 3000

app.post('/upload/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    req.form.complete(function(err, fields, files) {
        if (err) next(err)
        else {
          res.writeHead(200, {})
          res.end()
        }
    })
})

app.listen(port);

// TODO: how do we force a refresh of the entire app

/*
watch.watchTree('.', function (f, curr, prev	) {
  if (typeof f == "object" && prev === null && curr === null) // Finished walking the tree
  else if (prev === null) { // f is a new file
    // push this file up to the device and reload
    device.emit('file-updated', {file:curr})
  } else if (curr.nlink === 0) {
    // f was removed
  } else {
    // f was changed
  }
})
*/

io.sockets.on('connection', function (socket) {
  socket.on('set-role', function(role) {
    if (client == null || device == null) {
      if (role == 'client') client = socket
      else device = socket
      if (client != null && device != null) run()
    }
  });
});

function run() {
  var ops = [{op:'get-current-position',map:function(status, data) {return {status:status, position:data}}}
           , {op:'watch-position'}]

  io.sockets.emit('all-connected')

  ops.forEach(function(op) {
	  client.on(op.name, function (opts, fn) {
	    device.emit(op.name, opts, function(status, data) {
	      fn( (op.map?op.map():{status:status,data:data}) )
	    })
	  })
  })

  client.on('disconnect', function() {
    client = null
    if (device != null) device.emit('client-disconnect')
  });
  device.on('disconnect', function() {
    device = null
    if (client != null) client.emit('device-disconnect')
  });
}
