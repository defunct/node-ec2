# Require Node.js core modules.
sys             = require("sys")
events          = require("events")

# Require Node EC2 specific modules.
ResponseParser  = require("./response").ResponseParser
invoke          = require("./request").invoke

# Used whan a callback is not provided.
noop = -> true

class AmazonEC2Client extends events.EventEmitter

  constructor: (@options) ->
    @commands = []
    @parser = new ResponseParser

  call: (name, parameters, callback) ->
    @push false, name, parameters, callback

  poll: (name, parameters, callback) ->
    @push true, name, parameters, callback

  push: (retry, name, parameters, callback) ->
    if typeof parameters == "function"
      callback = parameters
      parameters = {}
    parameters or= {}
    callback or= noop
    @commands.push({ name, parameters, callback, retry })

  execute: () =>
    if (@commands.length == 0)
      @emit("end")
    else
      command = @commands.shift()
      invoke @options.key, @options.secret, command.name, command.parameters,
        (response, body) =>
          statusCode = Math.floor(response.statusCode / 100)
          if command.callback || statusCode != 2
            @parser.read body, (error, struct) =>
              if error
                @emit "error", error, response.statusCode
                return
              if statusCode == 2
                try
                  outcome = command.callback(struct)
                catch _
                  @emit "error",  _, response.statusCode
                  return
                if command.retry and !outcome
                  @commands.unshift command
                  execute = () => @execute()
                  setTimeout execute, 1000
                else
                  @execute()
              else
                @emit "error", struct, response.statusCode
          else
            @execute()

module.exports.createClient = (options) ->
  return new AmazonEC2Client options
