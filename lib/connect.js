'use strict';

var lets = require('lets'),
    Connection = require('./Connection');


module.exports = exports = function connect (options, next) {
  var c;

  //## Guards

  c = new Connection();

  this.setConnection(c);

  c.on('ready', next);
  c.on('end', lets.logger.debug.bind(lets.logger,
    exports.logPrefix + 'Connection to ' + options.host + ' ended'));
  c.on('close', lets.logger.debug.bind(lets.logger,
    exports.logPrefix + 'Connection to ' + options.host + ' closed'));
  c.on('error', function (err) {
    lets.logger.error(exports.logPrefix + err);
  });

  c.connect({
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    privateKey: options.privateKey
    // tryKeyboard?
  });
};

exports.logPrefix = 'lets-ssh: ';
