#!/usr/bin/env node

var configuration =
{ key: 'AKIAIBI7OMTXJHBKKPRA'
, secret: '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'
, endpoint: 'us-east-1'
, wsdlVersion: '2012-10-01'
};

require('proof')(1, function (callback) {
  var ec2 = require('../..')(configuration);
  ec2('DescribeRegions', {}, callback('object'));
}, function (object, equal) {
  equal(object.regionInfo.filter(function (info) { return info.regionName == 'us-east-1' }).length, 1, 'request');
});
