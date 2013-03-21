#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("AuthorizeSecurityGroupIngress", step());
  }, function (object) {
    var expected = { "return": true };
    deepEqual(object, expected, "parse authorize security group ingress");
  });
});

