#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("CreateImage", step());
  }, function (object) {
    var expected = { imageId: "ami-4fa54026" };
    deepEqual(object, expected, "parse create image");
  });
});
