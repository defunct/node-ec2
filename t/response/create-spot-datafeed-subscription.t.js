#!/usr/bin/env node

require("./proof")(1, function (step, parse, deepEqual) {
  step(function () {
    parse("CreateSpotDatafeedSubscription", step());
  }, function (object) {
    var expected =
    { spotDatafeedSubscription: 
      { ownerId: "254933287430"
      , bucket: "my-bucket"
      , prefix: null
      , state: "open"
      }
    };
    deepEqual(object, expected, "parse create spot datafeed subscription");
  });
});
