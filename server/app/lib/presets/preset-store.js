// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preset = require('./preset');

var _preset2 = _interopRequireDefault(_preset);

var _duplicateIdentifierError = require('./duplicate-identifier-error');

var _duplicateIdentifierError2 = _interopRequireDefault(_duplicateIdentifierError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sqlite3 = require('sqlite3');
var Promise = require('bluebird');

/**
 * Manages Preset persistant storage
 */

var PresetStore = function () {
  function PresetStore() {
    _classCallCheck(this, PresetStore);

    this.db = null;
  }

  /**
   * Opens the store database and inits it if needed
   *
   * After opening the database checks if the tables exist and creates them if they don't.
   *
   * @param filename
   *   Filename of the database file or ':memory:' for an anonymous in-memory database
   *   or an empty string for an anonymous disk-based database.
   *
   * @return {Promise}
   */


  _createClass(PresetStore, [{
    key: 'open',
    value: function open(filename) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.db = new sqlite3.Database(filename, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, // eslint-disable-line no-bitwise
        function (err) {
          if (err === null) {
            resolve();
          } else {
            reject(err);
          }
        });
      }).then(function () {
        return _this.tableExists();
      }).then(function (exists) {
        if (!exists) {
          return _this.createTables();
        }
        return Promise.resolve();
      });
    }

    /**
     * Closes the database
     *
     * @return {bluebird}
     */

  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.db.close(function (err) {
          if (err === null) {
            _this2.db = null;
            resolve();
          } else {
            reject();
          }
        });
      });
    }

    /**
     * Checks if the storage table exists in the database
     *
     * @return {bluebird}
     *  The promise resolves to a bool with the answer
     */

  }, {
    key: 'tableExists',
    value: function tableExists() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=$table;", { $table: 'presets' }, function (err, row) {
          if (err === null) {
            resolve(row !== undefined);
          } else {
            reject(err);
          }
        });
      });
    }

    /**
     * Creates the storage tables in the database
     *
     * @return {bluebird}
     */

  }, {
    key: 'createTables',
    value: function createTables() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.db.run('\nCREATE TABLE IF NOT EXISTS presets \n(\n  id integer PRIMARY KEY NOT NULL,\n  name text UNIQUE, \n  stationApps text\n)\n', [], function (err) {
          if (err === null) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    }

    /**
     * Creates a Preset object associated to this store
     *
     * @param {Object} data
     *  Data properties to initialize the preset
     * @return {Preset}
     */

  }, {
    key: 'createPreset',
    value: function createPreset() {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var answer = new _preset2.default(data);
      answer.setStore(this);
      return answer;
    }

    /**
     * Loads all presets
     *
     * @return {bluebird<Array<Preset>>}
     */

  }, {
    key: 'loadAllPresets',
    value: function loadAllPresets() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.db.all('\nSELECT *\nFROM presets \n', [], function (err, rows) {
          if (err === null) {
            var answer = [];
            if (rows !== undefined) {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var row = _step.value;

                  answer.push(_this5.createPreset({
                    id: row.id,
                    name: row.name,
                    stationApps: JSON.parse(row.stationApps)
                  }));
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
            resolve(answer);
          } else {
            reject(err);
          }
        });
      });
    }

    /**
     * Loads a Preset object with a certain ID
     *
     * @param {String} id
     * @return {bluebird}
     *  The promise resolves to a Preset or null if it doesn't exist
     */

  }, {
    key: 'loadPreset',
    value: function loadPreset(id) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.db.get('\nSELECT *\nFROM presets \nWHERE id = $id\n', {
          $id: id
        }, function (err, row) {
          if (err === null) {
            if (row !== undefined) {
              var answer = _this6.createPreset();
              answer.id = row.id;
              answer.name = row.name;
              answer.stationApps = JSON.parse(row.stationApps);
              resolve(answer);
            } else {
              resolve(null);
            }
          } else {
            reject(err);
          }
        });
      });
    }

    /**
     * Inserts a Preset in the database
     *
     * @param {Preset} preset
     * @return {bluebird}
     */

  }, {
    key: 'insertPreset',
    value: function insertPreset(preset) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7.db.run('\nINSERT INTO presets (name, stationApps)\nVALUES ($name, $stationApps)\n', {
          $name: preset.name,
          $stationApps: JSON.stringify(preset.stationApps)
        }, function callback(err) {
          if (err === null) {
            resolve(this.lastID);
          } else {
            reject(PresetStore.checkDuplicateNameError(err));
          }
        });
      });
    }

    /**
     * Updates a Preset in the database
     *
     * @param {Preset} preset
     * @return {bluebird}
     */

  }, {
    key: 'updatePreset',
    value: function updatePreset(preset) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        _this8.db.run('\nUPDATE presets\nSET name = $name, stationApps = $stationApps\nWHERE id = $id\n', {
          $id: preset.id,
          $name: preset.name,
          $stationApps: JSON.stringify(preset.stationApps)
        }, function (err) {
          if (err === null) {
            resolve();
          } else {
            reject(PresetStore.checkDuplicateNameError(err));
          }
        });
      });
    }

    /**
     * Removes a Preset from the database
     *
     * @param {Preset} preset
     * @return {bluebird}
     */

  }, {
    key: 'removePreset',
    value: function removePreset(preset) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        _this9.db.run('\nDELETE FROM presets\nWHERE id = $id\n', {
          $id: preset.id
        }, function (err) {
          if (err === null) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    }

    /**
     * Returns a list of all presets as {id, name} objects.
     *
     * @return {bluebird}
     */

  }, {
    key: 'listAllPresets',
    value: function listAllPresets() {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        _this10.db.all('\nSELECT id, name\nFROM presets\nORDER BY name\n      ', [], function (err, rows) {
          if (err !== null) {
            reject();
          } else {
            var answer = [];
            if (rows !== undefined) {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = rows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var row = _step2.value;

                  answer.push({
                    id: row.id,
                    name: row.name
                  });
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
            resolve(answer);
          }
        });
      });
    }

    /**
     * Checks an error to see if it was caused by a duplicate name and translates it
     * @param err
     */

  }], [{
    key: 'checkDuplicateNameError',
    value: function checkDuplicateNameError(err) {
      if (err.errno === 19) {
        return new _duplicateIdentifierError2.default('A preset with the selected name already exists');
      }
      return err;
    }
  }]);

  return PresetStore;
}();

exports.default = PresetStore;
//# sourceMappingURL=preset-store.js.map
