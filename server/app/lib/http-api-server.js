// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _longPollHandler = require('./long-poll-handler');

var _longPollHandler2 = _interopRequireDefault(_longPollHandler);

var _presetsModule = require('./presets/presets-module');

var _presetsModule2 = _interopRequireDefault(_presetsModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var iconmap = require('../../iconmap.json');
var express = require('express');
var bodyParser = require('body-parser');

var HttpAPIServer = function () {
  function HttpAPIServer(stationManager, nconf, logger) {
    _classCallCheck(this, HttpAPIServer);

    this.stationManager = stationManager;
    this.nconf = nconf;
    this.logger = logger;

    this.server = express();
    this.server.use(bodyParser.json());

    this.events = new EventEmitter();

    this.apiModules = [new _presetsModule2.default(this)];
  }

  /**
   * Initializes the server and its modules
   *
   * @return {Promise.<*>}
   */


  _createClass(HttpAPIServer, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var initializers = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.apiModules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var apiModule = _step.value;

          initializers.push(apiModule.init());
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return Promise.all(initializers).then(function () {
        _this.setupRoutes();
      });
    }

    /**
     * Sets up HTTP server routes / API entry points
     */

  }, {
    key: 'setupRoutes',
    value: function setupRoutes() {
      var _this2 = this;

      // getStations long poll handler
      this.stationsLongPoll = new _longPollHandler2.default(this.nconf.get('long_poll_timeout'));
      this.stationManager.events.on('stationUpdate', function () {
        _this2.stationsLongPoll.signalUpdate();
      });
      this.stationsLongPoll.events.on('wait', function () {
        _this2.events.emit('longPollWait');
      });
      this.stationsLongPoll.events.on('timeout', function () {
        _this2.events.emit('longPollTimeout');
      });

      var router = express.Router(); // eslint-disable-line new-cap
      router.get('/applications', this.getApplications.bind(this));
      router.get('/station_profiles', this.getStationProfiles.bind(this));
      router.get('/stations', this.getStations.bind(this));
      router.post('/stations/start', this.postStationsStart.bind(this));
      router.post('/stations/stop', this.postStationsStop.bind(this));
      router.post('/stations/change_app', this.postStationsChangeApp.bind(this));
      router.get('/station/:id/output', this.getStationOutput.bind(this));
      router.get('/server/output', this.getServerOutput.bind(this));
      router.get('/server/mklivestatus', this.getServerMKLivestatus.bind(this));
      router.get('/notifications', this.getNotifications.bind(this));

      this.server.use(router);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.apiModules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var apiModule = _step2.value;

          var moduleRouter = express.Router(); // eslint-disable-line new-cap
          apiModule.setupRoutes(moduleRouter);
          this.server.use(moduleRouter);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }

    /**
     * GET /applications handler
     * @param req
     * @param res
     */

  }, {
    key: 'getApplications',
    value: function getApplications(req, res) {
      var applications = Array.from(this.stationManager.getApplications()).map(function (a) {
        return a.toJSON();
      }).sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      res.json({
        applications: applications
      });
    }

    /**
     * GET /station_profiles handler
     * @param req
     * @param res
     */

  }, {
    key: 'getStationProfiles',
    value: function getStationProfiles(req, res) {
      var stationProfiles = Array.from(this.stationManager.getStationProfiles()).map(function (a) {
        return a.toJSON();
      }).sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      res.json({
        stationProfiles: stationProfiles
      });
    }

    /**
     * GET /stations handler
     * @param req
     * @param res
     */

  }, {
    key: 'getStations',
    value: function getStations(req, res) {
      var _this3 = this;

      this.stationsLongPoll.handleRequest(req, res).then(function (updateID) {
        var stations = _this3.stationManager.getStations().map(function (s) {
          return s.toJSON();
        });
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = stations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var station = _step3.value;

            station.icon = HttpAPIServer.getIconURL(station.app);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        res.json({
          updateID: updateID,
          stations: stations
        });
      }).catch(function () {
        res.json({});
      });
    }

    /**
     * POST /stations/start handler
     * @param req
     * @param res
     */

  }, {
    key: 'postStationsStart',
    value: function postStationsStart(req, res) {
      if (!req.body.ids) {
        this.logger.debug("HTTP request received: Start stations missing required 'ids' argument");
        res.status(400).send("Missing 'ids' argument");
        return;
      }
      this.logger.debug('HTTP request received: Start stations ' + req.body.ids);
      this.stationManager.startStations(req.body.ids);
      res.json({});
    }

    /**
     * POST /stations/stop handler
     * @param req
     * @param res
     */

  }, {
    key: 'postStationsStop',
    value: function postStationsStop(req, res) {
      if (!req.body.ids) {
        this.logger.debug("HTTP request received: Stop stations missing required 'ids' argument");
        res.status(400).send("Missing 'ids' argument");
        return;
      }
      this.logger.debug('HTTP request received: Stop stations ' + req.body.ids);
      this.stationManager.stopStations(req.body.ids);
      res.json({});
    }

    /**
     * POST /stations/change_app handler
     * @param req
     * @param res
     */

  }, {
    key: 'postStationsChangeApp',
    value: function postStationsChangeApp(req, res) {
      if (!req.body.ids) {
        this.logger.debug("HTTP request received: Change app missing required 'ids' argument");
        res.status(400).send("Missing 'ids' argument");
        return;
      }
      if (!req.body.app) {
        this.logger.debug("HTTP request received: Change app missing required 'app' argument");
        res.status(400).send("Missing 'app' argument");
        return;
      }
      this.logger.debug('HTTP request received: Change app of stations ' + req.body.ids + ' to ' + req.body.app);
      this.stationManager.changeApp(req.body.ids, req.body.app);
      res.json({});
    }

    /**
     * GET /station/:id/output handler
     * @param req
     * @param res
     */

  }, {
    key: 'getStationOutput',
    value: function getStationOutput(req, res) {
      this.logger.debug('HTTP request received: Get output of station ' + req.params.id);
      var station = this.stationManager.getStationByID(req.params.id);
      if (station) {
        res.json({
          lines: station.outputBuffer.getAll()
        });
      } else {
        this.logger.error('Requested output of non existant station ' + req.params.id);
        res.status(404).send('Station not found');
      }
    }

    /**
     * GET /server/output handler
     * @param req
     * @param res
     */

  }, {
    key: 'getServerOutput',
    value: function getServerOutput(req, res) {
      this.logger.debug('HTTP request received: Get global output');
      res.json({
        lines: this.stationManager.globalHilbertCLIOutputBuffer.getAll()
      });
    }

    /**
     * GET /server/mklivestatus handler
     * @param req
     * @param res
     */

  }, {
    key: 'getServerMKLivestatus',
    value: function getServerMKLivestatus(req, res) {
      this.logger.debug('HTTP request received: Get last MKLivestatus state');
      res.json({
        lastState: this.stationManager.lastMKLivestatusDump
      });
    }

    /**
     * GET /notifications handler
     * @param req
     * @param res
     */

  }, {
    key: 'getNotifications',
    value: function getNotifications(req, res) {
      this.logger.debug('HTTP request received: Get notifications');
      res.json({
        notifications: this.stationManager.getLog()
      });
    }
  }, {
    key: 'getServer',
    value: function getServer() {
      return this.server;
    }

    /**
     * Return the URL of the icon of the specified app
     *
     * @param {string} appID - ID of the app
     * @returns {string} - URL of the icon
     */

  }, {
    key: 'listen',


    /**
     * Start listening for requests on a port
     *
     * @param port
     */
    value: function listen(port) {
      this.server.listen(port);
      this.logger.info('Server listening on port ' + port + '.');
    }
  }], [{
    key: 'getIconURL',
    value: function getIconURL(appID) {
      if (iconmap[appID] !== undefined) {
        return 'icons/' + iconmap[appID];
      }
      return 'icons/none.png';
    }
  }]);

  return HttpAPIServer;
}();

exports.default = HttpAPIServer;
//# sourceMappingURL=http-api-server.js.map
