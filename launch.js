var ec2 = require("ec2"), sys = require("sys");

var AMI = "ami-2d4aa444";
var VOLUME = "vol-d6bf23bf";

function createRequest() {
  return ec2.request(
  { key: process.env["AWS_ACCESS_KEY_ID"]
  , secret: process.env["AWS_SECRET_ACCESS_KEY"]
  });
}

function launch () {
  var state = {};
  var amazon = ec2.createClient(
  { key: process.env["AWS_ACCESS_KEY_ID"]
  , secret: process.env["AWS_SECRET_ACCESS_KEY"]
  });
  amazon.on("error", function (error, statusCode) {
    console.log(arguments);
    if (error.message) {
      console.log(sys.inspect(error.message, true, 100));
      console.log(sys.inspect(error.stack, true, 100));
    } else {
      console.log(sys.inspect(error, true, 100));
    }
  });
  amazon.call("DescribeVolumes", function (struct) {
    var volume = struct.volumeSet.filter(function (volume) { return volume.volumeId == VOLUME; })[0];
    if (/^in-use|attaching$/.test(volume.status)) {
      throw new Error("Volume is already attached.");
    }
  });
  amazon.call("RunInstances",
  { ImageId: AMI
  , KeyName: "backup_key"
  , MinCount: 1
  , MaxCount: 1
  , "Placement.AvailabilityZone": "us-east-1b"
  }, function (struct) {
    state.reservationId = struct.reservationId; 
    state.instanceId = struct.instancesSet[0].instanceId;
  });
  amazon.poll("DescribeInstances", function (struct) {
    var reservation = struct.reservationSet.filter(function (reservation) {
      return reservation.reservationId == state.reservationId;
    })[0];
    var instance = reservation.instancesSet.filter(function (instance) {
      return instance.instanceId == state.instanceId;
    })[0];
    return instance.instanceState.name == "running";
  });
  amazon.call("AttachVolume",
  { VolumeId: VOLUME
  , InstanceId: function () { return state.instanceId; }
  , Device: "/dev/sdh"
  });
  amazon.poll("DescribeVolumes", { "VolumeId.1": VOLUME }, function (struct) {
    var attachment = struct.volumeSet[0].attachmentSet.filter(function (attachment) {
      return attachment.instanceId == state.instanceId;
    })[0];
    return attachment.status == "attached";
  });
  amazon.on("end", function () {
    console.log("Volume attached and running with instance: " + state.instanceId);
  });
  amazon.execute();
}

launch();

// vim: set ts=2 sw=2 et nowrap:
