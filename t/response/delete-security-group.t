#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("DeleteSecurityGroup", callback("object"));
}, function (object, deepEqual) {
  var expected = { "return": true };
  deepEqual(object, expected, "parse delete security group");
});
