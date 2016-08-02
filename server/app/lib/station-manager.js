// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _station = require('./station');

var _station2 = _interopRequireDefault(_station);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

/**
 * Service Layer to the DockApp system
 * Dispatches requests asynchronously and keeps cached state
 */

var StationManager = function () {

  /**
   * Create a Station Manager
   *
   * @param {Object} nconf - Instance of nconf configuration
   * @param {Object} logger - Instance of winston logger
   * @param {DockAppConnector} dockApp - DockApp connector
   * @param {MKLivestatusConnector} mkLivestatus - MKLivestatus connector
   */

  function StationManager(nconf, logger, dockApp, mkLivestatus) {
    _classCallCheck(this, StationManager);

    this.nconf = nconf;
    this.logger = logger;

    this.dockApp = dockApp;
    this.mkLivestatus = mkLivestatus;

    this.events = new EventEmitter();
    this.logEntries = [];
    this.lastLogID = 1;
  }

  /**
   * Reads the station configuration and begins polling station status
   *
   * @return {Promise}
   */


  _createClass(StationManager, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return this.loadStationConfig().then(function () {
        var pollLoopBody = function pollLoopBody() {
          var pollDelay = _this.nconf.get('MKLivestatusPollDelay');
          var consecutiveErrors = 0;
          var errorDigestSize = 50;
          _this.pollMKLivestatus().then(function () {
            consecutiveErrors = 0;
            setTimeout(pollLoopBody, pollDelay);
          }).catch(function (error) {
            if (consecutiveErrors % errorDigestSize) {
              _this.logger.error(error.message);
              if (consecutiveErrors !== 0) {
                _this.logger.error('Repeated polling errors (' + errorDigestSize + ' times)');
              }
            }
            consecutiveErrors++;
            setTimeout(pollLoopBody, pollDelay);
          });
        };
        pollLoopBody();
      });
    }

    /**
     * Loads the station configuration.
     *
     * If the configuration was already loaded this method clears it
     * and reloads everything
     *
     * @returns {Promise}
     */

  }, {
    key: 'loadStationConfig',
    value: function loadStationConfig() {
      var _this2 = this;

      this.clearStations();
      this.signalUpdate();

      return this.dockApp.getStationConfig().then(function (stationsCFG) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = stationsCFG[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var stationCFG = _step.value;

            _this2.addStation(new _station2.default(stationCFG));
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

        _this2.signalUpdate();
      });
    }

    /**
     * Adds a station to the manager
     * @param {Station} aStation
     */

  }, {
    key: 'addStation',
    value: function addStation(aStation) {
      this.stationList.push(aStation);
      this.stationIndex.set(aStation.id, aStation);
    }

    /**
     * Removes a station from the manager
     * @param {Station} aStation
     */

  }, {
    key: 'removeStation',
    value: function removeStation(aStation) {
      var i = this.stationList.indexOf(aStation);
      if (i !== -1) {
        this.stationList.splice(i, 1);
      }

      this.stationIndex.delete(aStation.id);
    }

    /**
     * Removes all the stations
     */

  }, {
    key: 'clearStations',
    value: function clearStations() {
      this.stationIndex = new Map();
      this.stationList = [];
    }

    /**
     * Get the ordered list of stations
     * @returns {Array}
     */

  }, {
    key: 'getStations',
    value: function getStations() {
      return this.stationList;
    }

    /**
     * Return a station identified by ID
     *
     * @param {string} id - Station ID
     * @returns {Station}
     */

  }, {
    key: 'getStationByID',
    value: function getStationByID(id) {
      return this.stationIndex.get(id);
    }

    /**
     * Start indicated stations
     *
     * @param {Iterable} stationIDs - IDs of stations to start
     * @return {Promise}
     */

  }, {
    key: 'startStations',
    value: function startStations(stationIDs) {
      var _this3 = this;

      var eligibleStations = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = stationIDs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var stationID = _step2.value;

          var station = this.getStationByID(stationID);
          if (station && station.state === _station2.default.OFF) {
            station.state = _station2.default.STARTING;
            station.status = 'Waiting to start...';
            eligibleStations.push(stationID);
          }
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

      this.signalUpdate();

      return Promise.map(eligibleStations, function (eligibleStation) {
        var station = _this3.getStationByID(eligibleStation);
        station.status = 'Starting...';
        _this3.signalUpdate();
        return _this3.dockApp.startStation(station.id, station.outputBuffer).then(function () {
          // station.state = Station.ON;
          // station.status = '';
          _this3.log('message', station, 'Station started');
        }).catch(function () {
          station.state = _station2.default.ERROR;
          station.status = 'Failure starting the station';
          _this3.log('error', station, 'Error starting station');
        }).then(function () {
          _this3.signalUpdate();
        });
      }, { concurrency: this.nconf.get('scriptConcurrency') });
    }

    /**
     * Stop indicated stations
     *
     * @param {Iterable} stationIDs - IDs of stations to stop
     * @return {Promise}
     */

  }, {
    key: 'stopStations',
    value: function stopStations(stationIDs) {
      var _this4 = this;

      var eligibleStations = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = stationIDs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var stationID = _step3.value;

          var station = this.getStationByID(stationID);
          if (station && station.state === _station2.default.ON) {
            station.state = _station2.default.STOPPING;
            station.status = 'Waiting to stop...';
            eligibleStations.push(stationID);
          }
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

      this.signalUpdate();

      return Promise.map(eligibleStations, function (eligibleStation) {
        var station = _this4.getStationByID(eligibleStation);
        station.status = 'Stopping...';
        _this4.signalUpdate();
        return _this4.dockApp.stopStation(station.id, station.outputBuffer).then(function () {
          // station.state = Station.OFF;
          // station.status = '';
          _this4.log('message', station, 'Station stopped');
        }).catch(function () {
          station.state = _station2.default.ERROR;
          station.status = 'Failure stopping the station';
          _this4.log('error', station, 'Error stopping station');
        }).then(function () {
          _this4.signalUpdate();
        });
      }, { concurrency: this.nconf.get('scriptConcurrency') });
    }

    /**
     * Change the application running in indicated stations
     *
     * @param {iterable} stationIDs - IDs of stations in which to change the appID
     * @param {string} appID - Name of the appID to run
     */

  }, {
    key: 'changeApp',
    value: function changeApp(stationIDs, appID) {
      var _this5 = this;

      var eligibleStations = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = stationIDs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var stationID = _step4.value;

          var station = this.getStationByID(stationID);
          if (station && station.state === _station2.default.ON && appID !== station.app) {
            station.state = _station2.default.SWITCHING_APP;
            station.status = 'Waiting to change app...';
            station.switching_app = appID;
            eligibleStations.push(stationID);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      this.signalUpdate();

      return Promise.map(eligibleStations, function (eligibleStation) {
        var station = _this5.getStationByID(eligibleStation);
        station.status = 'Switching to ' + appID + '...';
        _this5.signalUpdate();
        return _this5.dockApp.changeApp(eligibleStation, appID, station.outputBuffer).then(function () {
          _this5.log('message', station, 'Launched app ' + appID);
        }).catch(function () {
          station.app = appID;
          station.state = _station2.default.ERROR;
          station.status = 'Failure launching app';
          _this5.log('error', station, 'Failed to launch app ' + appID);
        }).then(function () {
          _this5.signalUpdate();
        });
      }, { concurrency: this.nconf.get('scriptConcurrency') });
    }

    /**
     * Return the station activity log
     *
     * Each log entry is an object with the following structure:
     * - id {string} : Unique id of the entry
     * - time {string} : Timestamp in ISO format
     * - type {string} : info | warning | error
     * - message {string} : Event description
     *
     * @returns {Array}
     */

  }, {
    key: 'getLog',
    value: function getLog() {
      return this.logEntries;
    }

    /**
     * Logs an event
     *
     * @param {string} type - Event type: info | warning | error
     * @param {Station|null} station - station associated with the event logged
     * @param {string} message - Message to log
     */

  }, {
    key: 'log',
    value: function log(type, station, message) {
      var newLogEntry = {
        id: this.lastLogID,
        time: new Date().toISOString(),
        type: type,
        message: message
      };

      if (station !== null) {
        newLogEntry.station_id = station.id;
        newLogEntry.station_name = station.name;
      }

      this.lastLogID++;
      this.logEntries.push(newLogEntry);

      var maxEntries = this.nconf.get('max_log_length');
      if (this.logEntries.length > maxEntries) {
        this.logEntries = this.logEntries.slice(this.logEntries.length - maxEntries);
      }
    }

    /**
     * Polls MKLivestatus and updates the state of stations
     * @returns {Promise}
     */

  }, {
    key: 'pollMKLivestatus',
    value: function pollMKLivestatus() {
      var _this6 = this;

      return this.mkLivestatus.getState().then(function (allStationsStatus) {
        var changes = false;

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = allStationsStatus[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var stationStatus = _step5.value;

            var station = _this6.getStationByID(stationStatus.id);
            if (station) {
              if (station.updateFromMKLivestatus(stationStatus)) {
                changes = true;
              }
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (changes) {
          _this6.signalUpdate();
        }
      });
    }
    /**
     * Signal listeners that station data was modified
     * @private
     */

  }, {
    key: 'signalUpdate',
    value: function signalUpdate() {
      this.events.emit('stationUpdate');
    }
  }]);

  return StationManager;
}();

exports.default = StationManager;
//# sourceMappingURL=station-manager.js.map
