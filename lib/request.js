var crypto, http, invoke, pad, querystring, timestamp;

crypto = require("crypto");

http = require("https");

querystring = require("querystring");

pad = function(n) {
  if (n < 10) {
    return "0" + n;
  } else {
    return n;
  }
};

timestamp = function() {
  var date, i, now, offset, part, _len, _ref;
  now = new Date();
  date = [];
  offset = {
    Month: 1
  };
  _ref = "FullYear - Month - Date T Hours : Minutes :00Z".split(/\s/);
  for (i = 0, _len = _ref.length; i < _len; i++) {
    part = _ref[i];
    date.push(i % 2 ? part : pad(now["getUTC" + part]() + (offset[part] || 0)));
  }
  return date.join("");
};

invoke = function(endpoint, wsdlVersion, key, secret, command, parameters, callback) {
  var digest, hmac, key, map, name, names, query, request, toSign, value, _i, _len;
  map = {
    AWSAccessKeyId: key,
    Action: command,
    SignatureMethod: "HmacSHA256",
    Timestamp: timestamp(),
    SignatureVersion: 2,
    Version: wsdlVersion ? wsdlVersion : "2011-05-15"
  };
  for (key in parameters) {
    value = parameters[key];
    map[key] = typeof parameters[key] === "function" ? parameters[key]() : parameters[key];
  }
  names = ((function() {
    var _results;
    _results = [];
    for (key in map) {
      value = map[key];
      _results.push(key);
    }
    return _results;
  })()).sort();
  query = [];
  for (_i = 0, _len = names.length; _i < _len; _i++) {
    name = names[_i];
    query.push(querystring.escape(name) + "=" + querystring.escape(map[name]));
  }
  if (!~endpoint.indexOf(".")) endpoint = "ec2." + endpoint + ".amazonaws.com";
  toSign = "GET\n" + (endpoint + "\n") + "/\n" + query.join("&");
  hmac = crypto.createHmac("sha256", secret);
  hmac.update(toSign);
  digest = querystring.escape(hmac.digest("base64"));
  query.push("Signature=" + digest);
  request = http.request({
    port: 443,
    host: endpoint,
    method: "GET",
    path: "/?" + query.join("&"),
    headers: { host: endpoint }
  }, function(response) {
    var body;
    body = "";
    response.setEncoding("utf8");
    response.on("data", function(chunk) {
      return body += chunk;
    });
    response.on("end", function() {
      return callback(null, response, body);
    });
    return response.on("error", function(error) {
      return callback(error);
    });
  });
  request.on("error", function(error) {
    return callback(error);
  });
  request.end();
  return true;
};

module.exports.invoke = invoke;
