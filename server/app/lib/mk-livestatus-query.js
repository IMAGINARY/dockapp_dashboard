// Compiled by Babel
// ** DO NOT EDIT THIS FILE DIRECTLY **
//
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Generates MK Livestatus queries
 *
 * This class is responsible for formatting the query and parsing
 * the response, but not with the actual communication. The connector
 * that handles communication is passed on creation.
 *
 * http://mathias-kettner.com/checkmk_livestatus.html
 */

var MKLivestatusQuery = function () {

  /**
   * Constructor
   * @param {MKLivestatusConnector} connector
   */

  function MKLivestatusQuery(connector) {
    _classCallCheck(this, MKLivestatusQuery);

    this.connector = connector;
    this.tableName = null;
    this.queryColumns = [];
    this.queryColumnAliases = null;
    this.queryFilters = [];
  }

  /**
   * Inits a GET query
   * @param {String} tableName
   * @returns {MKLivestatusQuery}
   */


  _createClass(MKLivestatusQuery, [{
    key: 'get',
    value: function get(tableName) {
      this.tableName = tableName;
      return this;
    }

    /**
     * Specifies columns to return
     *
     * If this method is never called the query will return all columns
     * If it's called several times the columns will be added
     *
     * @param {Array|String} columnList
     * @returns {MKLivestatusQuery}
     */

  }, {
    key: 'columns',
    value: function columns(columnList) {
      this.queryColumns = this.queryColumns.concat(columnList);

      return this;
    }

    /**
     * Specifies aliases to column names
     *
     * An array with one alias per queries columned must be provided.
     * @param {Array} columnAliases
     * @returns {MKLivestatusQuery}
     */

  }, {
    key: 'asColumns',
    value: function asColumns(columnAliases) {
      this.queryColumnAliases = columnAliases;

      return this;
    }

    /**
     * Adds a filter condition
     *
     * This class does not yet support disjunctions (OR)
     *
     * @param {String} condition
     * @returns {MKLivestatusQuery}
     */

  }, {
    key: 'filter',
    value: function filter(condition) {
      this.queryFilters.push(condition);

      return this;
    }

    /**
     * Converts the query to a string command
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      var output = [];
      output.push('GET ' + this.tableName);

      if (this.queryColumns.length > 0) {
        output.push('Columns: ' + this.queryColumns.join(' '));
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.queryFilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var filter = _step.value;

          output.push('Filter: ' + filter);
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

      output.push('OutputFormat: json');
      output.push('ColumnHeaders: on');

      return output.join('\n');
    }

    /**
     * Executes the query
     * @returns {Promise}
     * @resolve {Array} Response rows
     * @reject {Error}
     */

  }, {
    key: 'execute',
    value: function execute() {
      var _this = this;

      return this.connector.sendCommand(this.toString()).then(function (response) {
        return _this.parseResponse(response);
      });
    }

    /**
     * Parses the response arrays to an array of objects
     * Uses the first row as a list of names.
     * @private
     *
     * @param response {String}
     * @returns {Array}
     */

  }, {
    key: 'parseResponse',
    value: function parseResponse(response) {
      var rows = JSON.parse(response);

      if (!rows instanceof Array) {
        throw new Error('Unable to parse MKLivestatus response: ' + response);
      }

      if (rows.length < 1) {
        throw new Error('Empty MKLivestatus response');
      }

      var firstRow = rows.slice(0, 1)[0];
      var nameRow = this.queryColumnAliases !== null ? this.queryColumnAliases : firstRow;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = nameRow[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var columnName = _step2.value;

          if (this.queryColumns.indexOf(columnName) === -1) {
            throw new Error('MKLivestatus response includes unexpected column ' + columnName + ' (' + nameRow + ')');
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.queryColumns[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _columnName = _step3.value;

          if (nameRow.indexOf(_columnName) === -1) {
            throw new Error('MKLivestatus response missing column ' + _columnName + ' (' + nameRow + ')');
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

      var rest = rows.slice(1);
      var objects = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = rest[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var row = _step4.value;

          var rowObject = {};
          for (var i = 0; i !== nameRow.length && i < 100; i++) {
            rowObject[nameRow[i]] = row[i];
          }
          objects.push(rowObject);
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

      return objects;
    }
  }]);

  return MKLivestatusQuery;
}();

exports.default = MKLivestatusQuery;
//# sourceMappingURL=mk-livestatus-query.js.map