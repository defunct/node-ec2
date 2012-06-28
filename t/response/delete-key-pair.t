#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("DeleteKeyPair", callback("object"));
}, function (object, deepEqual) {
  var expected = { "return": true };
  deepEqual(expected, object, "parse delete key pair");
});
