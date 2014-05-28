'use strict';

var Readable = require('stream').Readable;

module.exports = exports = function (cmd, callback) {
  var stream = new Readable(),
      i = 0;

  stream._read = function () {
    if(i++ === 0) {
      this.push('test');
    }
    else {
      this.push(null);
    }
  };

  callback(null, stream);

  setImmediate(function () {
    //stream.emit('data', 'test');
    stream.emit('end');
    stream.emit('close');
    stream.emit('exit', 0, 0);
  });
};
