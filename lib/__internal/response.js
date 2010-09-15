var sax = require("sax"),
    libxml = require("libxmljs");

function parser (callback) {
  function convert(name, value) {
  // It seems that this method ought be correct for the most part.

  // How nice it would be to get the type information from the XSD, but I can't
  // find a validating parser for JavaScript that exposes XSD information.

  // Anyhoo...
    if (/Time$/.test(name)) {
      var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d*)Z/.exec(value);
      if (match) {
        match = match.slice(1).map(function (part) { return parseInt(part, 10); });
        return new Date(Date.UTC(match[0], match[1] - 1, match[2], match[3], match[4], match[5], match[6]));
      }
    }
    // Sizes are strings according to the XSD, but let's convert anyway.
    if (/size$/i.test(name)) {
      return parseInt(value, 10);
    }
    if (name == "return" && /^true|false$/.test(value)) {
      return value == "true";
    }
    return value;
  }
  var  base = {}, accumulator = [], depth = 0, names = [], branches = [ base ];
  var sax = new libxml.SaxPushParser(function(cb) {
    cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
      if (elem == "item") {
        if (branches.length != depth) {
          branches.push([]);
        }
        names.push(elem);
      } else if (depth != 0) {
        if (depth > 1 && branches.length != depth) {
          branches.push({});
        }
        names.push(elem);
      }
      accumulator.length = 0;
      depth++;
    });
    cb.onEndElementNS(function(elem, prefix, uri) {
      depth--;
      if (depth == 0) {
        callback(null, base);
      } else if (names[depth - 1] == "item") {
        var map = branches.pop();
        branches[branches.length - 1].push(map);
        names.pop();
      } else if (branches[depth]) {
        var map = branches.pop();
        branches[branches.length - 1][names.pop()] = map;
      } else {
        var name = names.pop();
        var value = accumulator.length == 0 ? null : convert(name, accumulator.join(""));
        branches[branches.length - 1][name] = value;
        accumulator.length = 0;
      }
    });
    cb.onCharacters(function(chars) {
      if (/\S/.exec(chars)) accumulator.push(chars);
    });
    cb.onError(function(msg) { callback(new Error(msg), null); });
  });
  return  { read: function (characters) { sax.push(characters); }
          }
}

module.exports.parser = parser;
// vim: set ts=2 sw=2 et nowrap:
