#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("AuthorizeSecurityGroupIngress", callback("object"));
}, function (object, deepEqual) {
  var expected = { "return": true };
  deepEqual(object, expected, "parse authorize security group ingress");
});

