'use strict';

/*global it:true, describe:true, before:true*/
/*jshint unused:false*/

var
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    lets = require('lets'),
    Letsfile = require('./Letsfile'),
    letsSSH = require('../.'),
    Connection = require('../lib/Connection'),
    config;

chai.should();
chai.use(sinonChai);


/* Spies
============================================================================= */

sinon.spy(letsSSH, 'connect');
sinon.spy(letsSSH, 'disconnect');

Connection.prototype.connect = sinon.spy();
Connection.prototype.end = sinon.spy();
Connection.prototype._exec = sinon.spy(require('./execStub'));

exports.onDeployCallback = null;
exports.onDeploy = function (options, next) {
  this.getConnection(function (c) {
    c.exec('test', exports.onDeployCallback = sinon.spy(function () {
      next();
    }));
  });
};

exports.sshOptions = {
  host: '',
  username: '',
  password: ''
};


/* Tests
============================================================================= */

var config = lets.load(Letsfile);

describe('After emitting `connect`', function () {
  before(function (next) {
    lets.runTasks(config, 'connect', 'testing', next);
    config._stages.testing._connection.emit('ready');
  });

  describe('the connect callback', function () {
    it('should have been called', function () {
      letsSSH.connect.should.always.have.been.calledWithMatch(
        exports.sshOptions, sinon.match.func);
    });
  });

  describe('the disconnect callback', function () {
    it('should not have been called', function () {
      /* jshint expr:true*/
      letsSSH.disconnect.should.not.have.been.called;
    });
  });
});

describe('After emitting `disconnect`', function () {
  before(function (next) {
    lets.runTasks(config, 'disconnect', 'testing', next);
  });

  describe('the disconnect callback', function () {
    it('should have been called', function () {
      letsSSH.disconnect.should.always.have.been.calledWithMatch(
        exports.sshOptions, sinon.match.func);
    });
  });
});

describe('After emitting `deploy`', function () {
  before(function (next) {
    config = lets.load(Letsfile);
    lets.runTasks(config, 'deploy', 'testing', next);
    config._stages.testing._connection.emit('ready');
  });

  describe('the onDeploy listener', function () {
    it('shoud have been called', function () {
      exports.onDeployCallback.should.have.always.been.calledWithMatch(
        sinon.match.falsy, 'test');

      Connection.prototype._exec.should.always.have.been.calledWithMatch(
        'test', sinon.match.object, sinon.match.func);
    });
  });
});
