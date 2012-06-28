#!/usr/bin/env node

require("./proof")(1, function (parse, callback) {
  parse("CancelSpotInstanceRequests", callback("object"));
}, function (object, deepEqual) {
  var expected =
  { requestId: "59dbff89-35bd-4eac-99ed-be587ed81825"
  , spotInstanceRequestSet: [ { spotInstanceRequestId: 'sir-e95fae02', state: "cancelled" } ]
  };
  deepEqual(object, expected, "parse cancel spot instance requests");
});
