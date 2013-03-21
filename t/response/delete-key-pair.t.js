#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () { 
    parse("DeleteKeyPair", step());
  }, function (object) {
    var expected = { "return": true };
    deepEqual(object, expected, "parse delete key pair");
  });
});
