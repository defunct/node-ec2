# Require Node.js core modules.
http            = require("http")

# Require Node EC2 specific modules.
ResponseParser  = require("./response").ResponseParser
invoke          = require("./request").invoke

# Used whan a callback is not provided.
amazon = (options, splat) ->
  extended = options
  switch splat.length
    when 1, 4
      extended = {}
      for set in [ options, splat[0] ]
        extended[key] = value for key, value of set
  switch splat.length
    when 3
      [ name, parameters, callback ] = splat
    when 4
      [ name, parameters, callback ] = splat[1..]
  switch splat.length
    when 0
      options
    when 1
      (splat...) -> amazon(extended, splat)
    when 3, 4
      { endpoint, key, secret } = options
      invoke endpoint, key, secret, name, parameters, (error, response, body) ->
        console.log body
        if error
          callback error
        else
          statusCode = Math.floor(response.statusCode / 100)
          if statusCode == 2
            # We cannot reuse the ResponseParser, since node-xml does not reset
            # itself and offers tno reset function.
            (new ResponseParser).read(body, callback)
          else
            callback new Error(http.STATUS_CODES[response.statusCode])

module.exports = amazon({}, [ {} ])
