(function() {
  var AmazonEC2Client, ResponseParser, events, invoke, noop, sys;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  sys = require("sys");
  events = require("events");
  ResponseParser = require("./response").ResponseParser;
  invoke = require("./request").invoke;
  noop = function() {
    return true;
  };
  AmazonEC2Client = function(_b) {
    var _a;
    this.options = _b;
    _a = this;
    this.execute = function(){ return AmazonEC2Client.prototype.execute.apply(_a, arguments); };
    this.commands = [];
    this.parser = new ResponseParser();
    return this;
  };
  __extends(AmazonEC2Client, events.EventEmitter);
  AmazonEC2Client.prototype.call = function(name, parameters, callback) {
    return this.push(false, name, parameters, callback);
  };
  AmazonEC2Client.prototype.poll = function(name, parameters, callback) {
    return this.push(true, name, parameters, callback);
  };
  AmazonEC2Client.prototype.push = function(retry, name, parameters, callback) {
    if (typeof parameters === "function") {
      callback = parameters;
      parameters = {};
    }
    parameters || (parameters = {});
    return this.commands.push({
      name: name,
      parameters: parameters,
      callback: callback,
      retry: retry
    });
  };
  AmazonEC2Client.prototype.execute = function() {
    var command;
    if (this.commands.length === 0) {
      return this.emit("end");
    } else {
      command = this.commands.shift();
      return invoke(this.options.key, this.options.secret, command.name, command.parameters, __bind(function(response, body) {
        var statusCode;
        statusCode = Math.floor(response.statusCode / 100);
        return command.callback || statusCode !== 2 ? this.parser.read(body, __bind(function(error, struct) {
          var execute, outcome;
          if (error) {
            this.emit("error", [error, responder.statusCode]);
            return null;
          }
          if (statusCode === 2) {
            try {
              outcome = (command.callback || noop)(struct);
            } catch (_) {
              this.emit("error", [_, responder.statusCode]);
              return null;
            }
            if (command.retry && !outcome) {
              this.commands.unshift(command);
              execute = __bind(function() {
                return this.execute;
              }, this);
              return setTimeout(execute, 1000);
            } else {
              return this.execute();
            }
          } else {
            return this.emit("error", [struct, responder.statusCode]);
          }
        }, this)) : this.execute();
      }, this));
    }
  };
  module.exports.createClient = function(options) {
    return new AmazonEC2Client(options);
  };
})();
