// Require EC2.
var ec2 = require("ec2")
  , fs = require("fs")
  , path = require("path")
  , configuration = path.resolve(process.env.HOME, ".aws")
  ;

// Read in the configuration above.
var configuration = JSON.parse(fs.readFileSync(configuration, "utf8"));

// Create an ec2 function that uses your configuration.
ec2 = ec2(configuration)

// Run an instance and wait for it to become ready.
ec2("RunInstances", {
  ImageId: "ami-2d4aa444", KeyName: "syntechdev_aws_key", MinCount: 1, MaxCount: 1
}, running);


var reservationId, instanceId;
function running (error, response) {
  if (error) throw error;
  reservationId = response.reservationId
  instanceId = response.instancesSet[0].instanceId;
  describe();
}

function describe () {
  ec2("DescribeInstances", {}, starting);
}

function starting (error, response) {
  if (error) throw error;
  var reservation = response.reservationSet.filter(function (reservation) {
    return reservation.reservationId == reservationId;
  })[0];
  var instance = reservation.instancesSet.filter(function (instance) {
    return instance.instanceId == instanceId;
  })[0];
  if (instance.instanceState.name == "running") ready();
  else setTimeout(describe, 2500);
}

function ready () {
  console.log("Instance created with id: " + instanceId);
}
