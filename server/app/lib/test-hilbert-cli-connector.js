// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Testing stub for HilbertCLIConnector
 *
 * Simulates the hilbert-cli operations with a random delay
 */
var TestHilbertCLIConnector = function () {

  /**
   * Returns the state of the stations
   * Returns an array of objects with shape
   * {name: 'station name ', state: 0, state_type: 1,
   * app_state: 0, app_state_type: 1, app_name: 'fg app name'}
   *
   * @returns {Promise}
   * @resolve {Array}
   */
  function TestHilbertCLIConnector(testBackend, nconf, logger) {
    _classCallCheck(this, TestHilbertCLIConnector);

    this.nconf = nconf;
    this.logger = logger;
    this.testBackend = testBackend;
  }

  /**
   * Reads the station config
   * @returns {Promise}
   * @resolve {Array} - List of stations
   * @reject {Error}
   */


  _createClass(TestHilbertCLIConnector, [{
    key: "getHilbertCfg",
    value: function getHilbertCfg(output) {
      return this.testBackend.getHilbertCfg(output);
    }

    /**
     * Starts a station
     *
     * @param {string} stationID - ID of the station
     * @param {stream} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: "startStation",
    value: function startStation(stationID, output) {
      return this.testBackend.startStation(stationID, output);
    }

    /**
     * Stops a station
     *
     * @param {string} stationID - ID of the station
     * @param {stream} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: "stopStation",
    value: function stopStation(stationID, output) {
      return this.testBackend.stopStation(stationID, output);
    }

    /**
     * Change the foreground application running in a station
     *
     * @param {string} stationID - ID of the station
     * @param {string} appID - ID of the app to set
     * @param {stream} output - Command output should be written here
     * @returns {Promise}
     */

  }, {
    key: "changeApp",
    value: function changeApp(stationID, appID, output) {
      return this.testBackend.changeApp(stationID, appID, output);
    }
  }]);

  return TestHilbertCLIConnector;
}();

exports.default = TestHilbertCLIConnector;
//# sourceMappingURL=test-hilbert-cli-connector.js.map
