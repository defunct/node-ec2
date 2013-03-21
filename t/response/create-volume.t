#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("CreateVolume", step());
  }, function (object) {
    var expected =
    { volumeId: "vol-4d826724"
    , size: 800
    , status: "creating"
    , createTime: new Date(Date.UTC(2008, 4, 7, 11, 51, 50))
    , availabilityZone: "us-east-1a"
    , snapshotId: null
    };
    deepEqual(object, expected, "parse create volume");
  });
});
