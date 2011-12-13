# Require Node.js core modules.
sys             = require("sys")
events          = require("events")

# Require Node EC2 specific modules.
ResponseParser  = require("./response").ResponseParser
invoke          = require("./request").invoke

# Used whan a callback is not provided.
noop = -> true

class AmazonEC2Client extends events.EventEmitter

  constructor: (@_options) ->
    @_commands = []
    @_options.endpoint or= "us-east-1"

  call: (name, parameters, callback) ->
    @_push false, name, parameters, callback

  poll: (name, parameters, callback) ->
    @_push true, name, parameters, callback

  _push: (retry, name, parameters, callback) ->
    if typeof parameters == "function"
      callback = parameters
      parameters = {}
    parameters or= {}
    callback or= noop
    @_commands.push({ name, parameters, callback, retry })

  execute: () =>
    if (@_commands.length == 0)
      @emit("end")
    else
      command = @_commands.shift()
      invoke @_options.endpoint, @_options.key, @_options.secret, command.name, command.parameters,
        (error, response, body) =>
          if error
            @emit "error", error
          else
            statusCode = Math.floor(response.statusCode / 100)
            if command.callback || statusCode != 2
              # Unfortunately, we cannot reuse the ResponseParser, since node-xml
              # does not reset itself and offers tno reset function.
              parser = new ResponseParser
              parser.read body, (error, struct) =>
                if error
                  @emit "error", error, null, response.statusCode
                  return
                if statusCode == 2
                  try
                    outcome = command.callback(struct)
                  catch _
                    @emit "error",  _, response.statusCode
                    return
                  if command.retry and !outcome
                    @_commands.unshift command
                    execute = () => @execute()
                    setTimeout execute, 1000
                  else
                    @execute()
                else
                  console.log struct
                  @emit "error", null, struct, response.statusCode
            else
              @execute()

module.exports.createClient = (options) ->
  return new AmazonEC2Client options
