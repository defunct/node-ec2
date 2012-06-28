#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("CreateSecurityGroup", callback("object"));
}, function (object, deepEqual) {
  var expected = { "return": true };
  deepEqual(expected, object, "parse errors");
});
