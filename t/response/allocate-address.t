#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("AllocateAddress", step());
  }, function (object) {
    var expected = { "publicIp": "67.202.55.255" };
    deepEqual(object, expected, "parse allocate address");
  });
});
