// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nagios = require('../nagios');

var _nagios2 = _interopRequireDefault(_nagios);

var _testHilbertCliConnector = require('./test-hilbert-cli-connector');

var _testHilbertCliConnector2 = _interopRequireDefault(_testHilbertCliConnector);

var _testMkLivestatusConnector = require('./test-mk-livestatus-connector');

var _testMkLivestatusConnector2 = _interopRequireDefault(_testMkLivestatusConnector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TestBackend = function () {
  function TestBackend(nconf, logger) {
    _classCallCheck(this, TestBackend);

    this.simulateDelays = false;
    this.nconf = nconf;
    this.logger = logger;

    this.hilbertCLIConnector = new _testHilbertCliConnector2.default(this, nconf, logger);
    this.mkLivestatusConnector = new _testMkLivestatusConnector2.default(this, nconf, logger);

    this.hilbertCfg = null;

    this.state = new Map();
    this.station_cfg = new Map();
  }

  /**
   * Loads test data
   *
   * If any data was previously loaded it's overwritten.
   *
   * @param {Array} hilbertCfg An array of station configurations
   */


  _createClass(TestBackend, [{
    key: 'load',
    value: function load(hilbertCfg) {
      this.hilbertCfg = hilbertCfg;

      this.state = new Map();
      this.station_cfg = new Map();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.entries(hilbertCfg.Stations)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var stationID = _step$value[0];
          var stationData = _step$value[1];

          this.addStation(stationID, stationData);
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
    }

    /**
     * Adds a station
     *
     * @param id ID of the station
     * @param stationCfg Configuration of the station, taken from the configuration file
     */

  }, {
    key: 'addStation',
    value: function addStation(id, stationCfg) {
      this.station_cfg.set(id, {
        id: id,
        name: stationCfg.name,
        description: stationCfg.description,
        profile: stationCfg.profile,
        type: stationCfg.type,
        default_app: stationCfg.client_settings.hilbert_station_default_application,
        compatible_apps: stationCfg.compatible_applications
      });

      this.initStationState(id);
    }

    /**
     * Initializes the state of a station to the default (station down, app down)
     *
     * @param {String} id Station ID
     */

  }, {
    key: 'initStationState',
    value: function initStationState(id) {
      this.state.set(id, {
        id: id,
        state: _nagios2.default.HostState.DOWN,
        state_type: _nagios2.default.StateType.HARD,
        app_state: _nagios2.default.ServiceState.UNKNOWN,
        app_state_type: _nagios2.default.StateType.HARD,
        app_id: ''
      });
    }

    /**
     * Returns a HilbertCLIConnector stub for testing
     * @returns {TestHilbertCLIConnector}
     */

  }, {
    key: 'getHilbertCLIConnector',
    value: function getHilbertCLIConnector() {
      return this.hilbertCLIConnector;
    }

    /**
     * Returns a MKLivestatusConnector stub for testing
     * @returns {TestMKLivestatusConnector}
     */

  }, {
    key: 'getMKLivestatusConnector',
    value: function getMKLivestatusConnector() {
      return this.mkLivestatusConnector;
    }
  }, {
    key: 'getStationState',
    value: function getStationState() {
      var answer = [];

      var toStopUnexpectedly = this.nconf.get('test-backend:stop-unexpectedly') || [];
      var unreachable = this.nconf.get('test-backend:unreachable') || [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.state.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var stationState = _step2.value;

          var newState = Object.assign({}, stationState);

          if (toStopUnexpectedly.includes(stationState.id)) {
            newState.state = _nagios2.default.HostState.DOWN;
            newState.app_state = _nagios2.default.ServiceState.DOWN;
            newState.app_state_type = _nagios2.default.StateType.HARD;
            newState.app_id = '';
            // This new state overrides the internal state
            this.state.set(stationState.id, newState);
          }
          if (unreachable.includes(stationState.id)) {
            newState.state = _nagios2.default.HostState.UNREACHABLE;
            // This new state is does not override the internal state
          }

          answer.push(newState);
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

      this.nconf.set('test-backend:stop-unexpectedly', []);

      return answer;
    }

    /**
     * Reads the station config
     * @returns {Promise}
     * @resolve {Array} - List of stations
     * @reject {Error}
     */

  }, {
    key: 'getHilbertCfg',
    value: function getHilbertCfg(output) {
      var _this = this;

      return new Promise(function (resolve) {
        output.write('Simulating reading hilbert configuration. Waiting a random delay...');
        _this.randomDelay(1000, 3000).then(function () {
          output.write('Wait finished.');
          resolve(_this.hilbertCfg);
        });
      });
    }

    /**
     * Starts a station
     *
     * @param stationID
     * @param {Writable} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: 'startStation',
    value: function startStation(stationID, output) {
      var _this2 = this;

      if (this.nconf.get('test-backend:sim-fail-cli') === true) {
        return Promise.reject(new Error('Simulated Hilbert CLI failure'));
      }

      return new Promise(function (resolve) {
        if (_this2.nconf.get('test-backend:sim-timeout') === true) {
          output.write('Simulating starting station ' + stationID + ' with operation that times out.');
        } else {
          output.write('Simulating starting station ' + stationID + '. Waiting a random delay...');
          _this2.randomDelay(3000, 8000).then(function () {
            output.write('Wait finished.');
            var stationState = _this2.state.get(stationID);
            var stationCfg = _this2.station_cfg.get(stationID);
            if (stationState && stationState.state === _nagios2.default.HostState.DOWN) {
              stationState.state = _nagios2.default.HostState.UP;
              stationState.app_state = _nagios2.default.ServiceState.OK;
              stationState.app_state_type = _nagios2.default.StateType.HARD;
              stationState.app_id = stationCfg.default_app;
              output.write('Station state set to UP with app ' + stationState.app_id + '.');
            }
          });
        }

        resolve();
      });
    }

    /**
     * Stops a station
     *
     * @param stationID
     * @param {Writable} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: 'stopStation',
    value: function stopStation(stationID, output) {
      var _this3 = this;

      if (this.nconf.get('test-backend:sim-fail-cli') === true) {
        return Promise.reject(new Error('Simulated Hilbert CLI failure'));
      }

      return new Promise(function (resolve) {
        if (_this3.nconf.get('test-backend:sim-timeout') === true) {
          output.write('Simulating stopping station ' + stationID + ' with operation that times out.');
        } else {
          output.write('Simulating stopping station ' + stationID + '. Waiting a random delay...');
          _this3.randomDelay(2000, 6000).then(function () {
            output.write('Wait finished.');
            var stationState = _this3.state.get(stationID);
            if (stationState && stationState.state === _nagios2.default.HostState.UP) {
              stationState.state = _nagios2.default.HostState.DOWN;
              stationState.app_state = _nagios2.default.ServiceState.UNKNOWN;
              stationState.app_state_type = _nagios2.default.StateType.HARD;
              stationState.app_id = '';
              output.write('Station state set to DOWN.');
            }
          });
        }

        resolve();
      });
    }

    /**
     * Change the foreground application running in a station
     *
     * @param {string} stationID - ID of the station
     * @param {string} appID - ID of the app to set
     * @param {Writable} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: 'changeApp',
    value: function changeApp(stationID, appID, output) {
      var _this4 = this;

      if (this.nconf.get('test-backend:sim-fail-cli') === true) {
        return Promise.reject(new Error('Simulated Hilbert CLI failure'));
      }

      return new Promise(function (resolve, reject) {
        if (_this4.nconf.get('test-backend:sim-timeout') === true) {
          output.write('Simulating changing app for station ' + stationID + ' to ' + appID + ' with operation that times out.');
        } else {
          output.write('Simulating changing app for station ' + stationID + ' to ' + appID + '. Waiting a random delay...');
          _this4.randomDelay(1000, 5000).then(function () {
            output.write('Wait finished.');
            var stationState = _this4.state.get(stationID);
            var stationCfg = _this4.station_cfg.get(stationID);

            if (stationCfg.compatible_apps.indexOf(appID) >= 0) {
              stationState.app_id = appID;
              output.write('App changed.');
            }
          });
        }

        resolve();
      });
    }

    /**
     * Wait a random amount of time
     * @private
     * @param min
     * @param max
     * @returns {Promise}
     */

  }, {
    key: 'randomDelay',
    value: function randomDelay(min, max) {
      if (this.simulateDelays) {
        return new Promise(function (resolve) {
          var delay = Math.floor(Math.random() * (max - min)) + min;
          setTimeout(function () {
            resolve();
          }, delay);
        });
      }

      return Promise.resolve();
    }
  }]);

  return TestBackend;
}();

exports.default = TestBackend;
//# sourceMappingURL=test-backend.js.map
