var responder = require("./__internal/response"),
    requester = require("./__internal/request");

function request (options) {
  var callbacks = {};
  var commands = [];

  function noop () { return true; }

  function call(command, parameters, callback) {
    if (typeof parameters == 'function') {
      callback = parameters;
      parameters = {}; 
    }
    commands.push(
    { name: command
    , parameters: parameters
    , callback: callback
    });
  }

  function poll(command, parameters, callback) {
    if (typeof parameters == 'function') {
      callback = parameters;
      parameters = {}; 
    }
    commands.push(
    { name: command
    , parameters: parameters
    , callback: callback
    , retry: true
    });
  }

  function complete(callback) {
    callbacks.ready = callback; 
  }

  function error(callback) {
    callbacks.error = callback; 
  }

  function execute() {
    if (commands.length == 0) {
      if (callbacks.ready) callbacks.ready();
    } else {
      var command = commands.shift();
      requester.invoke(options.key, options.secret, command.name, command.parameters || {}, function (response, body) {
        var statusCode = Math.floor(response.statusCode / 100);
        if (command.callback || statusCode != 2) {
          var parser = responder.parser(function (error, struct) { 
            if (error) throw error;
            if (statusCode == 2) {
              try {
                var outcome = (command.callback || noop)(struct);
              } catch (_) {
                (callbacks.error || noop)(_);
                return;
              }
              if (command.retry && !outcome) {
                commands.unshift(command);
                setTimeout(execute, 1000);
              } else {
                execute();
              }
            } else {
              (callbacks.error || noop)(struct, responder.statusCode);
            }
          });
          parser.read(body);
        } else {
          execute();
        }
      });
    }
  }

  return  { call: call
          , poll: poll
          , complete: complete
          , error: error
          , execute: execute
          };
}

module.exports.request = request;
// vim: set ts=2 sw=2 et nowrap:
