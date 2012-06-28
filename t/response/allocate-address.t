#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("AllocateAddress", callback("object"));
}, function (object, deepEqual) {
  var expected = { "publicIp": "67.202.55.255" };
  deepEqual(expected, object, "parse allocate address");
});
