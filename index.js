'use strict';

var lets = require('lets');


module.exports = exports = lets.plugin(function (stage) {
  stage.on('connect', exports.connect);
  stage.on('disconnect', exports.disconnect);
});

exports.connect = require('./lib/connect');
exports.disconnect = require('./lib/disconnect');
