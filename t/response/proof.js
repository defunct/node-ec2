var response = require("../../lib/response")
  , fs = require("fs");
module.exports = require("proof")(function () {
  function parse (name, callback) {
    var parser = new response.ResponseParser();
    parser.read(fs.readFileSync(__dirname + "/responses/" + name, "utf8"), callback);
  }
  return { parse: parse };
});
