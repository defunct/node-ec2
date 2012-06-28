#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("CancelBundleTask", callback("object"));
}, function (object, deepEqual) {
  var expected =
  { bundleInstanceTask:
    { instanceId: "i-12345678"
    , bundleId: "bun-cla322b9"
    , state: "canceling"
    , startTime: new Date(Date.UTC(2008, 9, 7, 11, 41, 50))
    , updateTime: new Date(Date.UTC(2008, 9, 7, 11, 51, 50))
    , progress: "20%"
    , storage:
      { S3:
        { bucket: "my-bucket"
        , prefix: "my-new-image"
        }
      }
    }
  };
  deepEqual(expected, object, "parse cancel bundle task");
});

