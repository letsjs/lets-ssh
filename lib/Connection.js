'use strict';

var
    util = require('util'),
    Ssh = require('ssh2'),
    lets = require('lets'),
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
  lets.logger.info('Connecting to ' + options.host);
  this._connect(options);
};


/**
 * Execute a command. Intercepts ssh2's built-in #exec to simplify the interface.
 */

exports.prototype._exec = exports.prototype.exec;
exports.prototype.exec = function(command, options, callback) {
  if(!callback) {
    callback = options;
    options = {};
  }

  options.prefix = options.prefix || '';

  console.log(lets.logger.info.toString());
  lets.logger.info(options.prefix + 'Executing remote command `' + command + '`');

  this._exec(command, options, function (err, stream) {
    var error = '',
        result = '';

    if(err) {
      return callback(err);
    }

    stream.on('end', lets.logger.debug.bind(lets.logger, options.prefix + 'Command-stream ended'));
    stream.on('close', lets.logger.debug.bind(lets.logger, options.prefix + 'Command-stream closed'));

    stream.on('data', function (data, extended) {
      if(extended === 'stderr') {
        lets.logger.error(options.prefix + 'stderr: ' + data);
        error += data;
      }
      else {
        lets.logger.info(options.prefix + 'stdout: ' + data);
        result += data;
      }
    });

    stream.on('exit', function (code, signal) {
      lets.logger.debug(options.prefix + 'Command-stream exit-code: ' + code);
      lets.logger.debug(options.prefix + 'Command-stream exit-signal: ' + signal);

      callback(error || null, result);
    });
  });
};
