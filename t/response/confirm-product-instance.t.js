#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("ConfirmProductInstance", step());
  }, function (object) {
    var expected =
    { ownerId: "254933287430"
    , "return": true
    };
    deepEqual(object, expected, "parse confirm product instance");
  });
});
