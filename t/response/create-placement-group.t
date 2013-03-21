#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("CreatePlacementGroup", step());
  }, function (object) {
    var expected =
    { requestId: "d4904fd9-82c2-4ea5-adfe-a9cc3EXAMPLE"
    , "return": true
    };
    deepEqual(object, expected, "parse create placement group");
  });
});
