var ec2 = require("./lib/amazon"), sys = require("sys");

var args = process.argv.slice(2);

var name = args.shift();
var params = {};

for (var i = 0, length = args.length; i < length; i++) {
  params[args[i]] = params[args[i + 1]];
}

var amazon = ec2.createClient(
{ key: process.env["AWS_ACCESS_KEY_ID"]
, secret: process.env["AWS_SECRET_ACCESS_KEY"]
});
amazon.on("error", function (error, statusCode) {
  if (error.message) console.log(error.message);
  else console.log(error);
});
amazon.call(name, params, function (struct) {
  console.log(sys.inspect(struct, false, 100));
});
amazon.execute();

process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception: " + err);
});

// vim: set ts=2 sw=2 et nowrap:
