'use strict';

var lets = require('lets');
var prompt = require('prompt');
var Connection = require('./Connection');


module.exports = exports = function connect (options, next) {
  var c;

  //## Guards

  c = new Connection();

  this.setConnection(c);

  c.on('ready', next);
  c.on('end', lets.logger.debug.bind(lets.logger,
    exports.logPrefix, 'Connection to ' + options.host + ' ended'));
  c.on('close', lets.logger.debug.bind(lets.logger,
    exports.logPrefix, 'Connection to ' + options.host + ' closed'));
  c.on('error', lets.logger.error.bind(lets.logger, exports.logPrefix));
  c.on('keyboard-interactive', function (name, instructions, lang, messages, callback) {
    lets.logger.info(exports.logPrefix, messages[0].prompt);

    //## Handle prompt and stdout through lets.logger?
    if(instructions) {
      process.stdout.write(instructions + '\n');
    }

    prompt.message = prompt.delimiter = '';
    prompt.start();
    prompt.get(messages.map(function (message, i) {
      return {
        name: i+1,
        description: message.prompt,
        required: true,
        hidden: message.echo === false
      };
    }), function (err, result) {
      if(err) {
        return callback([]);
      }

      // Object/array hack because prompt doesn't just return an array and doesn't
      // accept 0 as a key
      result.length = Object.keys(result).length + 1;
      result = Array.prototype.splice.call(result, 1);

      callback(result);
    });
  });

  try {
    c.connect({
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      privateKey: options.privateKey,
      passphrase: options.passphrase,
      tryKeyboard: options.tryKeyboard,
      agent: options.agent,
      agentForward: options.agentForward,
      debug: lets.logger.debug.bind(lets.logger, exports.logPrefix)
    });
  }
  catch (e) {
    lets.logger.error(exports.logPrefix, e);
    next(e);
  }
};

exports.logPrefix = require('../package').name;
