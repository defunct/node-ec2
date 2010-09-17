var ec2 = require("./lib/ec2"), sys = require("sys");

var args = process.argv.slice(2);

var name = args.shift();
var params = {};

for (var i = 0, length = args.length; i < length; i++) {
  params[args[i]] = params[args[i + 1]];
}

function createRequest() {
  return ec2.request(
  { key: process.env["AWS_ACCESS_KEY_ID"]
  , secret: process.env["AWS_SECRET_ACCESS_KEY"]
  });
}

function command() {
  var request = createRequest();
  request.error(function (error, statusCode) {
    if (error.message) console.log(error.message);
    else console.log(error);
  });
  request.call(name, params, function (struct) {
    console.log(sys.inspect(struct, false, 100));
  });
  request.execute();
}

command();
