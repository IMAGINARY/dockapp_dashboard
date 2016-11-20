// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

var _stationManager = require('../lib/station-manager');

var _stationManager2 = _interopRequireDefault(_stationManager);

var _httpApiServer = require('../lib/http-api-server');

var _httpApiServer2 = _interopRequireDefault(_httpApiServer);

var _testBackend = require('../lib/test-backend');

var _testBackend2 = _interopRequireDefault(_testBackend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = require('winston');
var nconf = require('nconf');
var request = require('supertest');
require('should');

describe('HTTP Longpoll', function () {
  var apiServer = null;
  var httpServer = null;
  var stationManager = null;

  var pollWaited = false;
  var pollTimedOut = false;

  beforeEach(function (done) {
    nconf.defaults({
      port: '3000',
      hilbert_cli_path: '../work/dockapp',
      test: true,
      scriptConcurrency: 20,
      max_log_length: 100,
      log_directory: './log',
      log_level: 'info', // error, warn, info, verbose, debug, silly
      mkls_poll_delay: 1000,
      mkls_cmd: 'nc localhost 6557'
    });

    var testBackend = new _testBackend2.default(nconf, logger);
    testBackend.addStation({
      id: 'station_a',
      name: 'Station A',
      type: 'type_a',
      default_app: 'app_a',
      possible_apps: ['app_a', 'app_b', 'app_c']
    });

    stationManager = new _stationManager2.default(nconf, logger, testBackend.getHilbertCLIConnector(), testBackend.getMKLivestatusConnector());

    stationManager.init().then(function () {
      apiServer = new _httpApiServer2.default(stationManager, logger);
      httpServer = apiServer.getServer();

      pollWaited = false;
      pollTimedOut = false;
      apiServer.pollTimeoutDelay = 0;

      apiServer.events.on('longPollWait', function () {
        pollWaited = true;
      });

      apiServer.events.on('longPollTimeout', function () {
        pollTimedOut = true;
      });

      done();
    });
  });

  it('Responds immediately if out of sync', function (done) {
    request(httpServer).get('/stations/poll').query({ lastUpdateID: 0 }).set('Accept', 'application/json').expect('Content-Type', /json/).expect(200, function (err, res) {

      pollWaited.should.equal(false);
      pollTimedOut.should.equal(false);
      res.body.updateID.should.equal(1);
      done();
    });
  });

  it('Responds after an update if synced', function (done) {
    request(httpServer).get('/stations/poll').query({ lastUpdateID: 1 }).set('Accept', 'application/json').expect('Content-Type', /json/).expect(200, function (err, res) {
      // Response arrives after update
      pollWaited.should.equal(true);
      pollTimedOut.should.equal(false);
      res.body.updateID.should.be.above(1);
      done();
    });

    apiServer.events.on('longPollWait', function () {
      // Simulate an update after it begins the wait
      stationManager.startStations(['station_a']);
    });
  });

  it('Responds (empty response) if synced and times-out waiting for an update', function (done) {
    request(httpServer).get('/stations/poll').query({ lastUpdateID: 1 }).set('Accept', 'application/json').expect('Content-Type', /json/).expect(200, function (err, res) {
      // Response arrives after time out
      pollWaited.should.equal(true);
      pollTimedOut.should.equal(true);

      // Response should be empty
      var responseIsEmpty = Object.keys(res.body).length === 0 && res.body.constructor === Object;
      responseIsEmpty.should.equal(true);
      done();
    });
  });
});
//# sourceMappingURL=test-http-longpoll.test.js.map
