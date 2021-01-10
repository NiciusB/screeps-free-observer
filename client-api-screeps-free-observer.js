// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/compressed-json/shim/constants/Prefixes.js":[function(require,module,exports) {
/**
 * @memberof module:compressed-json.constants
 * @namespace Prefixes
 */
'use strict';
/** @lends module:compressed-json.constants.Prefixes */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var Prefixes = {
  POINTER_PREFIX: 'p:',
  ESCAPED_PREFIX: 'e:'
};
var _default = Prefixes;
exports.default = _default;
},{}],"../node_modules/compressed-json/shim/converters/stringConverter.js":[function(require,module,exports) {
/**
 * @memberof module:compressed-json.converters
 * @namespace stringConverter
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Prefixes = _interopRequireDefault(require("../constants/Prefixes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PrefixValues = Object.values(_Prefixes.default);
/** @lends module:compressed-json.converters.stringConverter */

var stringConverter = {
  toPointer: function toPointer(index) {
    return _Prefixes.default.POINTER_PREFIX + index.toString(36);
  },
  toEscaped: function toEscaped(raw) {
    var needsEscape = PrefixValues.some(function (v) {
      return raw.startsWith(v);
    });
    return needsEscape ? _Prefixes.default.ESCAPED_PREFIX + raw : raw;
  },
  fromEscaped: function fromEscaped(escaped) {
    var needsRestore = escaped.startsWith(_Prefixes.default.ESCAPED_PREFIX);
    return needsRestore ? escaped.slice(_Prefixes.default.ESCAPED_PREFIX.length) : escaped;
  },
  fromPointer: function fromPointer(pointer) {
    return pointer.slice(_Prefixes.default.POINTER_PREFIX.length);
  },
  isPointer: function isPointer(value) {
    return value.startsWith(_Prefixes.default.POINTER_PREFIX);
  }
};
var _default = stringConverter;
exports.default = _default;
},{"../constants/Prefixes":"../node_modules/compressed-json/shim/constants/Prefixes.js"}],"../node_modules/compressed-json/shim/compress.js":[function(require,module,exports) {
/**
 * @memberof module:compressed-json
 * @function compress
 * @param {Object} data
 * @param {Object} [options={}] - Optional settings
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stringConverter = _interopRequireDefault(require("./converters/stringConverter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/** @lends module:compressed-json.compress */
function compress(src) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$reservedKeys = options.reservedKeys,
      reservedKeys = _options$reservedKeys === void 0 ? [] : _options$reservedKeys,
      _options$reservedValu = options.reservedValues,
      reservedValues = _options$reservedValu === void 0 ? [] : _options$reservedValu;
  var MIN_SHARE_STRING_LENGTH = 4;
  var MAX_SHARE_STRING_LENGTH = 512;
  var keysDict = {};
  var knownValuesDict = {};
  var pointers = [];
  var keys = [];
  var wrappers = {};

  var shortKeyFor = function shortKeyFor(key) {
    if (key in keysDict) {
      return keysDict[key];
    }

    var keyIndex = keys.length;
    var shortKey = keyIndex.toString(36);
    keysDict[key] = shortKey;
    keys.push(key);
    return shortKey;
  };

  reservedKeys.forEach(function (reservedKey) {
    return shortKeyFor(reservedKey);
  });

  var stringValueFor = function stringValueFor(value, keyPath) {
    var canBeShared = MIN_SHARE_STRING_LENGTH <= value.length && value.length <= MAX_SHARE_STRING_LENGTH;

    if (canBeShared) {
      if (value in knownValuesDict) {
        if (knownValuesDict[value].shared) {
          return knownValuesDict[value].pointer;
        }

        var index = pointers.length;
        pointers.push(value);

        var pointer = _stringConverter.default.toPointer(index);

        knownValuesDict[value].pointer = pointer;
        knownValuesDict[value].shared = true;
        return pointer;
      }
    }

    knownValuesDict[value] = {
      keyPath: keyPath,
      shared: false,
      pointer: null
    };
    return _stringConverter.default.toEscaped(value);
  };

  reservedValues.forEach(function (reservedValue) {
    return stringValueFor(reservedValue);
  });

  var convert = function convert(values) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$keyPath = _ref.keyPath,
        keyPath = _ref$keyPath === void 0 ? '' : _ref$keyPath;

    if (Array.isArray(values)) {
      var arr = values.map(function (v, i) {
        return convert(v, {
          keyPath: [keyPath, i].join('/')
        });
      });
      wrappers[keyPath] = arr;
      return arr;
    }

    if (values === null) {
      return null;
    }

    var type = _typeof(values);

    switch (type) {
      case 'function':
        return null;

      case 'object':
        {
          if (values instanceof Date) {
            return values.toJSON();
          }

          var compressed = {};

          var _keys = Object.keys(values);

          for (var _i = 0, _keys2 = _keys; _i < _keys2.length; _i++) {
            var key = _keys2[_i];
            var value = values[key];
            var shortKey = shortKeyFor(key);
            compressed[shortKey] = convert(value, {
              keyPath: [keyPath, shortKey].join('/')
            });
          }

          wrappers[keyPath] = compressed;
          return compressed;
        }

      case 'string':
        return stringValueFor(values, keyPath);

      default:
        return values;
    }
  };

  var converted = convert(src);

  for (var _i2 = 0, _Object$values = Object.values(knownValuesDict); _i2 < _Object$values.length; _i2++) {
    var _Object$values$_i = _Object$values[_i2],
        pointer = _Object$values$_i.pointer,
        shared = _Object$values$_i.shared,
        keyPath = _Object$values$_i.keyPath;

    if (shared && keyPath) {
      var _keys3 = keyPath.split('/');

      var lastKey = _keys3.pop();

      var wrapper = wrappers[_keys3.join('/')];

      wrapper[lastKey] = pointer;
    }
  }

  var K = keys.slice(reservedKeys.length);
  var P = pointers.slice(reservedValues.length);
  return _objectSpread({}, K.length > 0 ? {
    K: K
  } : {}, {}, P.length > 0 ? {
    P: P
  } : {}, {
    _: converted
  });
}

compress.toString = function compressToString(data) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var compressed = compress(data, options);
  return JSON.stringify(compressed);
};

var _default = compress;
exports.default = _default;
},{"./converters/stringConverter":"../node_modules/compressed-json/shim/converters/stringConverter.js"}],"../node_modules/compressed-json/shim/decompress.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stringConverter = _interopRequireDefault(require("./converters/stringConverter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

var RADIX = 36;
/**
 * @memberof module:compressed-json
 * @function decompress
 * @param {Object} compressed
 * @param {Object} [options={}] - Optional settings
 */

function decompress(compressed) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$reservedKeys = options.reservedKeys,
      reservedKeys = _options$reservedKeys === void 0 ? [] : _options$reservedKeys,
      _options$reservedValu = options.reservedValues,
      reservedValues = _options$reservedValu === void 0 ? [] : _options$reservedValu;

  if (!compressed) {
    return null;
  }

  var _compressed$K = compressed.K,
      K = _compressed$K === void 0 ? [] : _compressed$K,
      _compressed$P = compressed.P,
      P = _compressed$P === void 0 ? [] : _compressed$P,
      values = compressed._;
  var keys = [].concat(_toConsumableArray(reservedKeys), _toConsumableArray(K));
  var pointers = [].concat(_toConsumableArray(reservedValues), _toConsumableArray(P));

  var stringValueFor = function stringValueFor(value) {
    if (_stringConverter.default.isPointer(value)) {
      var index = parseInt(_stringConverter.default.fromPointer(value), RADIX);
      return pointers[index];
    }

    return _stringConverter.default.fromEscaped(value);
  };

  var convert = function convert(values) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$keyPath = _ref.keyPath,
        keyPath = _ref$keyPath === void 0 ? '' : _ref$keyPath;

    if (Array.isArray(values)) {
      return values.map(function (v, i) {
        return convert(v, {
          keyPath: [keyPath, i].join('/')
        });
      });
    }

    if (values === null) {
      return null;
    }

    switch (_typeof(values)) {
      case 'undefined':
        {
          return;
        }

      case 'function':
        return null;

      case 'object':
        {
          var decompressed = {};
          var shortKeys = Object.keys(values);

          for (var _i = 0, _shortKeys = shortKeys; _i < _shortKeys.length; _i++) {
            var shortKey = _shortKeys[_i];
            var value = values[shortKey];
            var key = keys[parseInt(shortKey, RADIX)];
            decompressed[key] = convert(value, {
              keyPath: [keyPath, shortKey].join('/')
            });
          }

          return decompressed;
        }

      case 'string':
        return stringValueFor(values, keyPath);

      default:
        return values;
    }
  };

  return convert(values);
}

decompress.fromString = function decompressFromString(compressedString) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return decompress(JSON.parse(compressedString), options);
};

var _default = decompress;
exports.default = _default;
},{"./converters/stringConverter":"../node_modules/compressed-json/shim/converters/stringConverter.js"}],"../node_modules/compressed-json/shim/bind.js":[function(require,module,exports) {
/**
 * @memberof module:compressed-json
 * @function bind
 * @param {Object} config
 * @param {string[]} [config.reservedKeys=[]] - reservedKeys to bind
 * @param {string[]} [config.reservedValues=[]] - reservedValues to bind
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _compress = _interopRequireDefault(require("./compress"));

var _decompress = _interopRequireDefault(require("./decompress"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends module:compressed-json.bind */
function bind() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _config$reservedKeys = config.reservedKeys,
      reservedKeys = _config$reservedKeys === void 0 ? [] : _config$reservedKeys,
      _config$reservedValue = config.reservedValues,
      reservedValues = _config$reservedValue === void 0 ? [] : _config$reservedValue;

  var boundCompress = function boundCompress(src) {
    return (0, _compress.default)(src, {
      reservedKeys: reservedKeys,
      reservedValues: reservedValues
    });
  };

  boundCompress.toString = function (compressed) {
    return JSON.stringify(boundCompress(compressed));
  };

  var boundDecompress = function boundDecompress(src) {
    return (0, _decompress.default)(src, {
      reservedKeys: reservedKeys,
      reservedValues: reservedValues
    });
  };

  boundDecompress.fromString = function (compressedString) {
    return boundDecompress(JSON.parse(compressedString));
  };

  return {
    compress: boundCompress,
    decompress: boundDecompress
  };
}

var _default = bind;
exports.default = _default;
},{"./compress":"../node_modules/compressed-json/shim/compress.js","./decompress":"../node_modules/compressed-json/shim/decompress.js"}],"../node_modules/compressed-json/shim/index.js":[function(require,module,exports) {
/**
 * @module compressed-json
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "compress", {
  enumerable: true,
  get: function () {
    return _compress.default;
  }
});
Object.defineProperty(exports, "decompress", {
  enumerable: true,
  get: function () {
    return _decompress.default;
  }
});
Object.defineProperty(exports, "bind", {
  enumerable: true,
  get: function () {
    return _bind.default;
  }
});
exports.default = void 0;

var _compress = _interopRequireDefault(require("./compress"));

var _decompress = _interopRequireDefault(require("./decompress"));

var _bind = _interopRequireDefault(require("./bind"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @lends module:compressed-json */
var compressedJSON = {
  bind: _bind.default,
  compress: _compress.default,
  decompress: _decompress.default
};
var _default = compressedJSON;
exports.default = _default;
},{"./compress":"../node_modules/compressed-json/shim/compress.js","./decompress":"../node_modules/compressed-json/shim/decompress.js","./bind":"../node_modules/compressed-json/shim/bind.js"}],"index.js":[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var cjson = require('compressed-json');

var FreeObserver = /*#__PURE__*/function () {
  /**
   * Initialize FreeObserver
   * @param {Number} segmentID
   */
  function FreeObserver(segmentID) {
    _classCallCheck(this, FreeObserver);

    this.segmentID = segmentID;
    this.requestsToAddNextTick = [];
    /**
     * @type {{lastUpdated: number, requests: string[], responses: {{room: object.<string, object>, lastUpdated: number}}}|false}
     */

    this.data = false;
  }
  /**
   * Request room to observe, and return room data if available. Returns false if not available yet
   * @param {String} roomName
   */


  _createClass(FreeObserver, [{
    key: "getRoom",
    value: function getRoom(roomName) {
      this._markSegmentAsActive();

      this.requestsToAddNextTick.push(roomName);

      if (this.data && this.data.responses && this.data.responses[roomName]) {
        return this.data.responses[roomName].room || false;
      }

      return false;
    }
  }, {
    key: "_loadDataFromRawMemory",
    value: function _loadDataFromRawMemory() {
      if (!RawMemory.segments[this.segmentID]) return false;
      var tempData = cjson.decompress.fromString(RawMemory.segments[this.segmentID]);
      if (!tempData || !tempData.requests || !Array.isArray(tempData.requests)) return false; // Wait for server

      this.data = tempData;
      return true;
    }
  }, {
    key: "_saveDataToRawMemory",
    value: function _saveDataToRawMemory() {
      RawMemory.segments[this.segmentID] = cjson.compress.toString(this.data);
    }
  }, {
    key: "_markSegmentAsActive",
    value: function _markSegmentAsActive() {
      RawMemory.setActiveSegments([this.segmentID]);
    }
    /**
     * Call every tick
     */

  }, {
    key: "tick",
    value: function tick() {
      var _this = this;

      if (!this.data || this.data.requests.length) {
        // Ether initializing, or reloading data from raw memory if we're expecting new data
        this._markSegmentAsActive();

        this._loadDataFromRawMemory();
      }

      if (!this.data) {
        return;
      }

      if (this.requestsToAddNextTick.length) {
        // Add new pending requests
        this.requestsToAddNextTick.forEach(function (roomName, index) {
          _this.requestsToAddNextTick.splice(index, 1);

          if (_this.data.requests.indexOf(roomName) === -1) {
            _this.data.requests.push(roomName);
          }
        });

        this._saveDataToRawMemory();
      }
    }
  }]);

  return FreeObserver;
}();

module.exports = FreeObserver;
},{"compressed-json":"../node_modules/compressed-json/shim/index.js"}]},{},["index.js"], null)