// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

var _stationManager = require('./lib/station-manager');

var _stationManager2 = _interopRequireDefault(_stationManager);

var _dockappConnector = require('./lib/dockapp-connector');

var _dockappConnector2 = _interopRequireDefault(_dockappConnector);

var _testingConnector = require('./lib/testing-connector');

var _testingConnector2 = _interopRequireDefault(_testingConnector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appPackage = require('../package.json');
var logger = require('winston');
var nconf = require('nconf');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;

process.on('uncaughtException', function (err) {
  console.log(err);
  process.exitCode = 1;
});

app.use(bodyParser.json());

nconf.file('config.json');
nconf.defaults({
  port: '3000',
  dockapp_path: '../work/dockapp',
  test: false,
  max_log_length: 100,
  log_directory: './log',
  log_level: 'info' });

// error, warn, info, verbose, debug, silly
logger.add(logger.transports.File, {
  filename: nconf.get('log_directory') + '/dockapp_dashboard.log',
  level: nconf.get('log_level'),
  handleExceptions: true,
  json: false
});

logger.info('Starting dockapp_dashboard server (v' + appPackage.version + ')');

var connector = null;
if (nconf.get('test')) {
  connector = new _testingConnector2.default(nconf, logger);
} else {
  connector = new _dockappConnector2.default(nconf, logger);
}

var stationManager = new _stationManager2.default(nconf, logger, connector);

// Longpoll begin

var pollUpdateEmitter = new EventEmitter();
pollUpdateEmitter.setMaxListeners(100);
var updateID = 1;
var pollTimeoutDelay = 15000;

function respondJSON(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function stationDataResponse() {
  return {
    updateID: updateID,
    stations: stationManager.getStations()
  };
}

function emptyResponse(req, res) {
  return {};
}

app.get('/poll.json', function (req, res) {
  // if the client is out of sync respond immediately
  if (Number(req.query.lastSeen) !== updateID) {
    respondJSON(res, stationDataResponse());
  } else {
    (function () {
      // ... otherwise wait for an update to respond

      // On timeout send an empty update
      var pollTimeout = setTimeout(function () {
        pollUpdateEmitter.emit('update', emptyResponse());
      }, pollTimeoutDelay);

      // If there was an update respond
      pollUpdateEmitter.once('update', function (data) {
        clearTimeout(pollTimeout);
        respondJSON(res, data);
      });
    })();
  }
});

stationManager.events.on('stationUpdate', function () {
  updateID++;
  pollUpdateEmitter.emit('update', stationDataResponse());
});

// Longpoll end

app.get('/stations.json', function (req, res) {
  respondJSON(res, stationDataResponse());
});

app.post('/stations.json', function (req, res) {
  if (req.body.action === 'start') {
    stationManager.startStations(req.body.stationIDs);
    respondJSON(res, emptyResponse());
  } else if (req.body.action === 'stop') {
    stationManager.stopStations(req.body.stationIDs);
    respondJSON(res, emptyResponse());
  } else if (req.body.action === 'change_app') {
    stationManager.changeApp(req.body.stationIDs, req.body.app);
    respondJSON(res, emptyResponse());
  } else {
    res.writeHead(404, 'Action not found');
    res.end();
  }
});

app.get('/log.json', function (req, res) {
  respondJSON(res, { entries: stationManager.getLog() });
});

// Spawn server
var port = nconf.get('port');
app.listen(port);
logger.info('Server listening on port ' + port + '.');
//# sourceMappingURL=main.js.map
