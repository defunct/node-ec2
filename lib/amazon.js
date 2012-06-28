var http = require("http")
  , ResponseParser = require("./response").ResponseParser
  , invoke = require("./request").invoke
  , __slice = Array.prototype.slice;
  ;

function amazon (options, vargs) {
  var callback
    , endpoint
    , extended
    , key
    , name
    , parameters
    , secret
    , set
    , value
    , extensions
    ;

  extended = options;
  switch (vargs.length) {
    case 1:
    case 4:
      extended = {};
      extensions = [options, vargs[0]];
      for (i = 0, I = extensions.length; i < I; i++) {
        set = extensions[i];
        for (key in set) {
          value = set[key];
          extended[key] = value;
        }
      }
  }
  switch (vargs.length) {
    case 3:
      name = vargs[0], parameters = vargs[1], callback = vargs[2];
      break;
    case 4:
      name = vargs[1], parameters = vargs[2], callback = vargs[3];
      break;
  }
  switch (vargs.length) {
    case 0:
      return options;
    case 1:
      return function() {
        var vargs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return amazon(extended, vargs);
      };
    case 3:
    case 4:
      endpoint = options.endpoint, key = options.key, secret = options.secret;
      invoke(endpoint, key, secret, name, parameters, function(error, response, body) {
        var statusCode;
        if (error) {
          callback(error);
        } else {
          statusCode = Math.floor(response.statusCode / 100);
          if (statusCode === 2) {
            (new ResponseParser).read(body, callback);
          } else if (body) {
            (new ResponseParser).read(body, function(error, object) {
              if (error) {
                callback(new Error(http.STATUS_CODES[response.statusCode]));
              } else {
                error = new Error(object.Errors[0].Message);
                error.code = object.Errors[0].Code;
                error.status = statusCode;
                callback(error);
              }
            });
          } else {
            callback(new Error(http.STATUS_CODES[response.statusCode]));
          }
        }
      });
  }
};

module.exports = amazon({}, [{}]);
