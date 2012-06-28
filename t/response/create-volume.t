#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("CreateVolume", callback("object"));
}, function (object, deepEqual) {
  var expected =
  { volumeId: "vol-4d826724"
  , size: 800
  , status: "creating"
  , createTime: new Date(Date.UTC(2008, 4, 7, 11, 51, 50))
  , availabilityZone: "us-east-1a"
  , snapshotId: null
  };
  deepEqual(expected, object, "parse create volume");
});

