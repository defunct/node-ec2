var crypto = require("crypto"),
    http = require("http")
    querystring = require("querystring");

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
{ AWSAccessKeyId: process.env["AWS_ACCESS_KEY_ID"]
, Action: "DescribeInstances"
, SignatureMethod: "HmacSHA256"
, Timestamp: timestamp()
, SignatureVersion: 2
, Version: "2010-06-15"
};

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
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers));

    response.setEncoding('utf8');
    response.on("data", function (chunk) {
        console.log('BODY: ' + chunk);
    });
    response.on("end", function () {
        console.log("DONE");
    });
});
