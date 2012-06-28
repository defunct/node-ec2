# Node EC2 [![Build Status](https://secure.travis-ci.org/bigeasy/node-ec2.png?branch=master)](http://travis-ci.org/bigeasy/node-ec2)

Evended Node.js bindings to the EC2 Query API.

 * **Node EC2** is a minimal Node.js API with a pinch of sugar.
 * **Node EC2** creates a signed request from a AWS EC command name a plain old
JavaScript object of command parameters.
 * **Node EC2** parses the XML response and converts it into JSON.
 * **Node EC2** does **not** define control flow, so use your favorite control flow
library.
 * **Node EC** let's Amazon AWS do all the error checking in one place, then
   returns the errors as an `Error` to a Node.js style callback.

Because **Node EC2** is such a thin layer over the Amazon AWS EC2 API you can
use the [Amazon API
Reference](http://docs.amazonwebservices.com/AWSEC2/latest/APIReference/index.html?query-apis.html)
to find your way around. Node EC2 calls translate directly to Amazon Query API.

### Why So Simple?

Another implementation might set out to define a library of functions, one for
each function provided by the AWS EC2 API. This way, you could validate the
command name and parameters before you call.

We believe that if there's something wrong with your request, you'll find out
soon enough. The Amazon AWS endpoint will do a bang up job of checking for
errors, and will be able to do all the error checking in one place.

On the client side, we could validate parameter names, but on the AWS site
validation goes beyond semantics to authorization, service availability, etc.

If the Amazon AWS EC2 API adds a dozen new features overnight, you don't have to
wait for a new version of **Node EC2** to use them.

Becasue of this, there is a one to one mapping between the Amazon Query API and
the actions provided by node-ec2 and changes to the Amazon Query API are
available immediately to node-ec2 applications.

You can learn more about node-ec2 at the node-ec2 GitHub web page and by reading
the wiki.

### Synopsis

An example using
[RunInstances](http://docs.amazonwebservices.com/AWSEC2/latest/APIReference/index.html?ApiReference-query-RunInstances.html) to launch a 32-bit Fedora 17 instance in Virginia.

Our program reads the AWS secrets from a file named "~/.aws" that contains the
key and secret as JSON.

```
{ "key": "EXAMPLE"
, "secret": "EXAMPLE"
}
```

Our program launches and instance, then calls `"DescribeInstances"` until it is
ready to use. When it's read it prints the TK host name for use with `ssh`.

```javascript
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
  ImageId: "ami-2d4aa444", KeyName: "launch_key", MinCount: 1, MaxCount: 1
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
  var reservation, instance;
  reservation = response.reservationSet.filter(function (reservation) {
    return reservation.reservationId == reservationId;
  })[0];
  instance = reservation.instancesSet.filter(function (instance) {
    return instance.instanceId == instanceId;
  })[0];
  if (instance.instanceState.name == "running") ready();
  else setTimeout(describe, 2500);
}

function ready () {
  console.log("Instance created with id: " + instanceId);
}
```

I'm afraid you'll find that working with Amazon AWS is a bit wordy. The XML
documents seem to gravitate toward the longest possible element name that could
possibly describe the property

## Installing

The easiest way to install is using npm.

```
npm install ec2
```

You can also checkout the source code for using `git`. It has only one
dependency, the wonderful little XML parser `node-xml`.

### Construction

Node EC2 exports a function you can use to build an EC2 function. You can call
it directly from `require("ec2")` to build an `ec2` function configured for your
application.

```javascript
var ec2 = require("ec2")({ key: "<REDACTED>", secret: "<REDACTED>" });

ec2("DescribeInstances", {}, function (error, result) {
  if (error) throw error;
  console.log(reuslt)
});

```

Options to the ec2 function are:

 * `key` &mdash; Your Amazon AWS key.
 * `secret` &mdash; Your Amazon AWS secret key, which you should always keep
   secret.
 * `endpoint` &mdash; Either the region identifier or else the fully qualified
   domain name of the AWS server.

The region identfiers are one of the following.

 * `us-west-2` &mdash; Oregon.
 * `us-west-1` &mdash; California.
 * `us-east-1` &mdash; Virginia.
 * `sa-east-1` &mdash; Sao Paluo.
 * `ap-northeast-1` &mdash; Tokyo.
 * `ap-southeast-1` &mdash; Singapore.
 * `eu-west-1` &mdash; Ireland.
