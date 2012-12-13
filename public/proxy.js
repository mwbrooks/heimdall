var getCurrentPosition = function(win, fail, opts) {
   socket.emit('get-current-position', opts, function(data) {
     if (data.status == 'success') win(data.position);
     else fail(data);
   });
 };

 var getPicture = function(callback) {
   console.log('capture image');
   socket.emit('capture-image', { foo: 'bar' }, function(data) {
     console.log('capture image before callback');
     callback(data);
   });
 }