var isTimestamp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d*)Z/
  , xml = require("node-xml")
  ;

function ResponseParser() {
  var accumulator = [], depth = 0, names = [], _this = this;
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
      depth++;
    });
    sax.onEndElementNS(function(elem) {
      var map, match, name, value;
      if (--depth === 0) {
        _this.callback(null, _this.base);
      } else if (/^item|Error$/.test(names[depth - 1])) {
        map = _this.branches.pop();
        _this.branches[_this.branches.length - 1].push(map);
        names.pop();
      } else if (_this.branches[depth]) {
        map = _this.branches.pop();
        _this.branches[_this.branches.length - 1][names.pop()] = map;
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
              match = match.slice(1).map(function(part) { return +part });
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
        accumulator.length = 0;
      }
    });
    sax.onCharacters(function(chars) {
      if (accumulator.length === 0 && /\S/.test(chars)) {
        accumulator.push(chars);
      }
    });
    sax.onError(function(msg) {
      console.log("blurgh", msg);
      _this.callback(new Error(msg), null);
    });
  });
}

ResponseParser.prototype.read = function(text, callback) {
  this.base = {};
  this.branches = [this.base];
  this.callback = callback || function() {};
  this.sax.parseString(text);
};

module.exports.ResponseParser = ResponseParser;
