#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("BundleInstance", callback("object"));
}, function (object, deepEqual) {
  var expected =
  { requestId: "bun-c1a540a8"
  , bundleInstanceTask:
    { instanceId: "i-12345678"
    , bundleId: "bun-c1a540a8"
    , state: "bundling"
    , startTime: new Date(Date.UTC(2008, 9, 7, 11, 41, 50))
    , updateTime: new Date(Date.UTC(2008, 9, 7, 11, 51, 50))
    , progress: "70%"
    , storage:
      { S3:
        { bucket: "my-bucket"
        , prefix: "winami"
        }
      }
    }
  };
  deepEqual(object, expected, "parse bundle instance");
});
