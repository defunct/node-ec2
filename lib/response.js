var ResponseParser, isTimestamp, xml;

xml = require("node-xml");

isTimestamp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d*)Z/;

ResponseParser = (function() {
  function ResponseParser() {
    var accumulator, depth, names,
      _this = this;
    accumulator = [];
    depth = 0;
    names = [];
    this.sax = new xml.SaxParser(function(sax) {
      sax.onStartElementNS(function(elem) {
        if (/^item|Error$/.test(elem)) {
          if (_this.branches.length !== depth) _this.branches.push([]);
          names.push(elem);
        } else if (depth !== 0) {
          if (depth > 1 && _this.branches.length !== depth) {
            _this.branches.push({});
          }
          names.push(elem);
        }
        accumulator.length = 0;
        return depth++;
      });
      sax.onEndElementNS(function(elem) {
        var map, match, name, value;
        if (--depth === 0) {
          return _this.callback(null, _this.base);
        } else if (/^item|Error$/.test(names[depth - 1])) {
          map = _this.branches.pop();
          _this.branches[_this.branches.length - 1].push(map);
          return names.pop();
        } else if (_this.branches[depth]) {
          map = _this.branches.pop();
          return _this.branches[_this.branches.length - 1][names.pop()] = map;
        } else {
          name = names.pop();
          if (accumulator.length === 0) {
            value = null;
            if (name === "Errors" || /Set$/.test(name)) value = [];
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
            if (/size$/i.test(name)) value = parseInt(value, 10);
            if (name === "return" && /^true|false$/.test(value)) {
              value = value === "true";
            }
          }
          _this.branches[_this.branches.length - 1][name] = value;
          return accumulator.length = 0;
        }
      });
      sax.onCharacters(function(chars) {
        if (accumulator.length === 0 && /\S/.test(chars)) {
          return accumulator.push(chars);
        }
      });
      return sax.onError(function(msg) {
        console.log("blurgh", msg);
        return _this.callback(new Error(msg), null);
      });
    });
  }

  ResponseParser.prototype.read = function(text, callback) {
    this.base = {};
    this.branches = [this.base];
    this.callback = callback || function() {};
    return this.sax.parseString(text);
  };

  return ResponseParser;
})();

module.exports.ResponseParser = ResponseParser;
