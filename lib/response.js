(function() {
  var ResponseParser, isTimestamp, libxml;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  libxml = require("libxmljs");
  isTimestamp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d*)Z/;
  ResponseParser = function() {
    var accumulator, depth, names;
    accumulator = [];
    depth = 0;
    names = [];
    this.sax = new libxml.SaxPushParser(__bind(function(sax) {
      sax.onStartElementNS(__bind(function(elem) {
        if (/^item|Error$/.test(elem)) {
          if (this.branches.length !== depth) {
            this.branches.push([]);
          }
          names.push(elem);
        } else if (depth !== 0) {
          if (depth > 1 && this.branches.length !== depth) {
            this.branches.push({});
          }
          names.push(elem);
        }
        accumulator.length = 0;
        return depth++;
      }, this));
      sax.onEndElementNS(__bind(function(elem) {
        var map, match, name, value;
        if (--depth === 0) {
          return this.callback(null, this.base);
        } else if (/^item|Error$/.test(names[depth - 1])) {
          map = this.branches.pop();
          this.branches[this.branches.length - 1].push(map);
          return names.pop();
        } else if (this.branches[depth]) {
          map = this.branches.pop();
          return (this.branches[this.branches.length - 1][names.pop()] = map);
        } else {
          name = names.pop();
          if (accumulator.length === 0) {
            value = null;
            if (name === "Errors" || /Set$/.test(name)) {
              value = [];
            }
          } else {
            value = accumulator.join("");
            if (/Time$/.test(name)) {
              match = isTimestamp.exec(value);
              if (match) {
                match = match.slice(1).map(function(part) {
                  return parseInt(part, 10);
                });
                match[1]--;
                value = new Date(Date.UTC.apply(null, match));
              }
            }
            if (/size$/i.test(name)) {
              value = parseInt(value, 10);
            }
            if (name === "return" && /^true|false$/.test(value)) {
              value = value === "true";
            }
          }
          this.branches[this.branches.length - 1][name] = value;
          return (accumulator.length = 0);
        }
      }, this));
      sax.onCharacters(function(chars) {
        return accumulator.length === 0 && /\S/.test(chars) ? accumulator.push(chars) : null;
      });
      return sax.onError(__bind(function(msg) {
        return this.callback(new Error(msg), null);
      }, this));
    }, this));
    return this;
  };
  ResponseParser.prototype.read = function(text, callback) {
    this.base = {};
    this.branches = [this.base];
    this.callback = callback || function() {};
    return this.sax.push(text);
  };
  module.exports.ResponseParser = ResponseParser;
})();
