'use strict';

module.exports = function disconnect (options, done) {
  this.getConnection(function (c) {
    //## Check if the connection has been closed already

    c.on('end', done);
    c.end();
  });
};
