(function() {
  var ResponseParser, amazon, http, invoke,
    __slice = Array.prototype.slice;

  http = require("http");

  ResponseParser = require("./response").ResponseParser;

  invoke = require("./request").invoke;

  amazon = function(options, splat) {
    var callback, endpoint, extended, key, name, parameters, secret, set, value, _i, _len, _ref, _ref2;
    extended = options;
    switch (splat.length) {
      case 1:
      case 4:
        extended = {};
        _ref = [options, splat[0]];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          set = _ref[_i];
          for (key in set) {
            value = set[key];
            extended[key] = value;
          }
        }
    }
    switch (splat.length) {
      case 3:
        name = splat[0], parameters = splat[1], callback = splat[2];
        break;
      case 4:
        _ref2 = splat.slice(1), name = _ref2[0], parameters = _ref2[1], callback = _ref2[2];
    }
    switch (splat.length) {
      case 0:
        return options;
      case 1:
        return function() {
          var splat;
          splat = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return amazon(extended, splat);
        };
      case 3:
      case 4:
        endpoint = options.endpoint, key = options.key, secret = options.secret;
        return invoke(endpoint, key, secret, name, parameters, function(error, response, body) {
          var statusCode;
          if (error) {
            return callback(error);
          } else {
            statusCode = Math.floor(response.statusCode / 100);
            if (statusCode === 2) {
              return (new ResponseParser).read(body, callback);
            } else if (body) {
              return (new ResponseParser).read(body, function(error, object) {
                if (error) {
                  return callback(new Error(http.STATUS_CODES[response.statusCode]));
                } else {
                  error = new Error(object.Errors[0].Message);
                  error.code = object.Errors[0].Code;
                  error.status = statusCode;
                  return callback(error);
                }
              });
            } else {
              return callback(new Error(http.STATUS_CODES[response.statusCode]));
            }
          }
        });
    }
  };

  module.exports = amazon({}, [{}]);

}).call(this);
