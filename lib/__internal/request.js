var crypto = require("crypto"),
    http = require("http")
    querystring = require("querystring");

function invoke(key, secret, command, parameters, callback) {
    function pad(n) {
        return n < 10 ? "0" + n : n;
    }
    function timestamp() {
        var now = new Date();
        return "" + now.getUTCFullYear() +
              "-" + pad(now.getUTCMonth() + 1) +
              "-" + pad(now.getUTCDate()) +
              "T" + pad(now.getUTCHours()) +
              ":" + pad(now.getUTCMinutes()) +
              ":" + pad(now.getUTCSeconds())  +
              "Z";
    }

    var map =
    { AWSAccessKeyId: key
    , Action: command
    , SignatureMethod: "HmacSHA256"
    , Timestamp: timestamp()
    , SignatureVersion: 2
    , Version: "2010-06-15"
    };

    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        map[key] = typeof parameters[key] == 'function' ? parameters[key]() : parameters[key];
      }
    }

    var names = [];
    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            names.push(key); 
        }
    }
    var query = [];
    names.sort();
    for (var i = 0; i < names.length; i++) {
        query.push(querystring.escape(names[i]) + "=" + querystring.escape(map[names[i]]));
    }

    var toSign = "GET\n" +
        "ec2.amazonaws.com\n" +
        "/\n" +
        query.join("&");

    var hmac = crypto.createHmac("sha256", process.env["AWS_SECRET_ACCESS_KEY"]);
    hmac.update(toSign);
    var digest = querystring.escape(hmac.digest("base64"));

    query.push("Signature=" + digest);

    var client = http.createClient(443, "ec2.amazonaws.com", true);
    var request = client.request("GET", "/?" + query.join("&"), { host: "ec2.amazonaws.com" });
    request.end();
    request.on("response", function (response) {
        var body = "";
        response.setEncoding('utf8');
        response.on("data", function (chunk) {
            body += chunk;
        });
        response.on("end", function () {
            callback(response, body);
        });
    });
}
module.exports.invoke = invoke;
// vim: set ts=2 sw=2 et nowrap:
