'use strict';

var
    util = require('util'),
    Ssh = require('ssh2'),
    lets = require('lets'),
    pkg = require('../package'),
    Connection;


/**
 * Extends ssh2, so anything ssh2 does is possible. However some methods might
 * be altered to expose a more sane API.
 *
 * @constructor
 * @api public
 */

module.exports = exports = Connection = function Connection () {
  Ssh.call(this);
};

util.inherits(Connection, Ssh);


/* Public methods
============================================================================= */

/**
 * Connect to host. Intercepts ssh2's built-in #connect.
 */

exports.prototype._connect = exports.prototype.connect;
exports.prototype.connect = function(options) {
  lets.logger.info(pkg.name, 'Connecting to ' + options.host);
  this._connect(options);
};


/**
 * Execute a command. Intercepts ssh2's built-in #exec to simplify the interface.
 */

exports.prototype._exec = exports.prototype.exec;
exports.prototype.exec = function(command, callback) {
  lets.logger.info(pkg.name, 'Executing remote command `' + command + '`');

  this._exec(command, function (err, stream) {
    var error = '',
        result = '';

    if(err) {
      return callback(err);
    }

    stream.on('end', lets.logger.debug.bind(lets.logger, pkg.name, 'Command-stream ended'));
    stream.on('close', lets.logger.debug.bind(lets.logger, pkg.name, 'Command-stream closed'));
    stream.on('error', lets.logger.error.bind(lets.logger, pkg.name));

    stream.on('data', function (data, extended) {
      if(extended === 'stderr') {
        lets.logger.error(pkg.name, 'stderr: ' + data);
        error += data;
      }
      else {
        lets.logger.info(pkg.name, 'stdout: ' + data);
        result += data;
      }
    });

    stream.on('exit', function (code, signal) {
      var err = null;

      lets.logger.debug(pkg.name, 'Command-stream exit-code: ' + code);
      lets.logger.debug(pkg.name, 'Command-stream exit-signal: ' + signal);

      if(code) {
        err = new Error(error || result);
        err.code = code;
        err.signal = signal;
      }

      // result || error because it seems eg git writes to stderr because it's fun
      callback(err, result || error);
    });
  });
};
