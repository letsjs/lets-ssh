'use strict';

var
    letsSSH = require('../.'),
    test = require('./index');


module.exports = function (config) {
  config.addStage('testing', config.Stage()
    .plugin(letsSSH(test.sshOptions))
    .on('deploy', test.onDeploy));
};
