#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("CreateSpotDatafeedSubscription", callback("object"));
}, function (object, deepEqual) {
  var expected =
  { spotDatafeedSubscription: 
    { ownerId: "254933287430"
    , bucket: "my-bucket"
    , prefix: null
    , state: "open"
    }
  };
  deepEqual(expected, object, "parse create spot datafeed subscription");
});

