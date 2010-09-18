var message =
"\n\n\
==============================================================================\n\
Cannot find the ec2 module JavaScript.\n\
\n\
  Did you add ec2 to your local Node.js modules with the following?\n\
\n\
    git clone git://github.com/bigeasy/node-ec2.git ~/.node_modules/ec2\n\
\n\
  If so, you need to switch to the node_modules branch like so...\n\
\n\
    cd ~/node_modules/ec2\n\
    git checkout --track -b node_modules origin/node_modules\n\
\n\
  The problem you've incountered is that the master branch is the development\n\
  branch and contains only CoffeeScript, and none of the compiled\n\
  JavaScript. The node_modules branch contains the generated JavaScript for\n\
  people who want to install the bleeding edge from git.\n\
\n\
  If you are trying to un ec2 from a development checkout, please read\n\
  HACKING for more information on how to to build node-ec2.\n\
\n\
  Still confused? Pop over to #node.js on IRC and ask prettyrobots for help.\n\
==============================================================================\n"
try {
  var foo = require("./lib/amazon.js")
} catch (_) {
  if (_.message === "Cannot find module './lib/amazon.js'") {
    throw new Error(message);
    console.log(_);
  } else {
    throw _;
  }
}
