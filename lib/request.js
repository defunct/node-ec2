(function() {
  var crypto, http, invoke, pad, querystring, timestamp;
  var __hasProp = Object.prototype.hasOwnProperty;
  crypto = require("crypto");
  http = require("http");
  querystring = require("querystring");
  pad = function(n) {
    return n < 10 ? "0" + n : n;
  };
  timestamp = function() {
    var day, hours, minutes, month, now, year;
    now = new Date();
    year = now.getUTCFullYear();
    month = pad(now.getUTCMonth() + 1);
    day = pad(now.getUTCDate());
    hours = pad(now.getUTCHours());
    minutes = pad(now.getUTCMinutes());
    return "" + (year) + "-" + (month) + "-" + (day) + "T" + (hours) + ":" + (minutes) + ":00Z";
  };
  invoke = function(key, secret, command, parameters, callback) {
    var _a, _b, _c, _d, _e, _f, client, digest, headers, hmac, map, name, names, query, request, toSign, value;
    map = {
      AWSAccessKeyId: key,
      Action: command,
      SignatureMethod: "HmacSHA256",
      Timestamp: timestamp(),
      SignatureVersion: 2,
      Version: "2010-06-15"
    };
    _a = parameters;
    for (key in _a) {
      if (!__hasProp.call(_a, key)) continue;
      value = _a[key];
      map[key] = typeof parameters[key] === 'function' ? parameters[key]() : parameters[key];
    }
    names = (function() {
      _b = []; _c = map;
      for (key in _c) {
        if (!__hasProp.call(_c, key)) continue;
        value = _c[key];
        _b.push(key);
      }
      return _b;
    })();
    names.sort();
    query = [];
    _e = names;
    for (_d = 0, _f = _e.length; _d < _f; _d++) {
      name = _e[_d];
      query.push(querystring.escape(name) + "=" + querystring.escape(map[name]));
    }
    toSign = "GET\n" + "ec2.amazonaws.com\n" + "/\n" + query.join("&");
    hmac = crypto.createHmac("sha256", process.env["AWS_SECRET_ACCESS_KEY"]);
    hmac.update(toSign);
    digest = querystring.escape(hmac.digest("base64"));
    query.push("Signature=" + digest);
    client = http.createClient(443, "ec2.amazonaws.com", true);
    headers = {
      host: "ec2.amazonaws.com"
    };
    request = client.request("GET", "/?" + query.join("&"), headers);
    request.end();
    request.on("response", function(response) {
      var body;
      body = "";
      response.setEncoding("utf8");
      response.on("data", function(chunk) {
        return body += chunk;
      });
      return response.on("end", function() {
        return callback(response, body);
      });
    });
    return true;
  };
  module.exports.invoke = invoke;
})();
