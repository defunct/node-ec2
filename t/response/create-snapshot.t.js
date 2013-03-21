#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("CreateSnapshot", step());
  }, function (object) {
    var expected =
    { snapshotId: "snap-78a54011"
    , volumeId: "vol-4d826724"
    , volumeSize: 10
    , status: "pending"
    , startTime: new Date(Date.UTC(2008, 4, 7, 12, 51, 50))
    , progress: "60%"
    , ownerId: "213457642086"
    , description: "Daily Backup"
    };
    deepEqual(object, expected, "parse create snapshot");
  });
});
