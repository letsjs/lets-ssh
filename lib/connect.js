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
  c.on('keyboard-interactive', function (name, instructions, lang, prompt, callback) {
    lets.logger.info(prompt[0].prompt);

    //## auto-respond with password for now, implement tty prompting later
    if(options.password) {
      lets.logger.info(exports.logPrefix + 'responding with options.password');
      callback([options.password]);
    }
    else {
      throw(new Error('tryKeyboard is not properly implemented yet. If you need it working soon you\'re very welcome to find this line in the source and figure out a testable solution :)'));
    }
  });

  c.connect({
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    privateKey: options.privateKey,
    passphrase: options.passphrase,
    tryKeyboard: options.tryKeyboard,
    agent: options.agent
  });
};

exports.logPrefix = 'lets-ssh: ';
