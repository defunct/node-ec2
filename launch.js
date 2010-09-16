var ec2 = require("./lib/ec2");

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
  var request = createRequest();
  request.error(function (error, statusCode) {
    if (error.message) console.log(error.message);
    else console.log(error);
  });
  request.call("DescribeVolumes", function (struct) {
    var volume = struct.volumeSet.filter(function (volume) { return volume.volumeId == VOLUME; })[0];
    if (/^in-use|attaching$/.test(volume.status)) {
      throw new Error("Volume is already attached.");
    }
  });
  request.call("RunInstances",
  { ImageId: AMI
  , KeyName: "backup_key"
  , MinCount: 1
  , MaxCount: 1
  , "Placement.AvailabilityZone": "us-east-1b"
  }, function (struct) {
    state.reservationId = struct.reservationId; 
    state.instanceId = struct.instancesSet[0].instanceId;
  });
  request.poll("DescribeInstances", function (struct) {
    var reservation = struct.reservationSet.filter(function (reservation) {
      return reservation.reservationId == state.reservationId;
    })[0];
    var instance = reservation.instancesSet.filter(function (instance) {
      return instance.instanceId == state.instanceId;
    })[0];
    return instance.instanceState.name == "running";
  });
  request.call("AttachVolume",
  { VolumeId: VOLUME
  , InstanceId: function () { return state.instanceId; }
  , Device: "/dev/sdh"
  });
  request.poll("DescribeVolumes", { "VolumeId.1": VOLUME }, function (struct) {
    var attachment = struct.volumeSet[0].attachmentSet.filter(function (attachment) {
      return attachment.instanceId == state.instanceId;
    })[0];
    return attachment.status == "attached";
  });
  request.complete(function () {
    console.log("Volume attached and running with instance: " + state.instanceId);
  });
  request.execute();
}

launch();

// vim: set ts=2 sw=2 et nowrap:
