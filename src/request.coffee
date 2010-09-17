# Require Node.js core modules.
crypto          = require("crypto")
http            = require("http")
querystring     = require("querystring")

# Oh, how I miss you sprintf.
pad = (n) -> if n < 10 then "0" + n else n

# Generate a UTC timestamp in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601)
# for the Amazon Query API request. The Amazon Query API will respond with an
# error if the timestamp of the request is not in the last twenty minutes or so.
timestamp = () ->
  now       = new Date()
  year      = now.getUTCFullYear()
  month     = pad(now.getUTCMonth() + 1)
  day       = pad(now.getUTCDate())
  hours     = pad(now.getUTCHours())
  minutes   = pad(now.getUTCMinutes())
  "#{year}-#{month}-#{day}T#{hours}:#{minutes}:00Z"

invoke = (key, secret, command, parameters, callback) ->
  # The parameters common to all Amazon Query API requests as documented in
  # [Making Query Requests](http://docs.amazonwebservices.com/AWSEC2/latest/DeveloperGuide/index.html?using-query-api.html)
  # in the Amazon Elastic Compute Cloud Developer Guide.
  map =
    AWSAccessKeyId: key
    Action: command
    SignatureMethod: "HmacSHA256"
    Timestamp: timestamp()
    SignatureVersion: 2
    Version: "2010-06-15"

  # Merge the request specific parameters with the common parameters.
  for key, value of parameters
    map[key] =
      if typeof parameters[key] == 'function'
        parameters[key]()
      else
        parameters[key]

  # The Amazon Query API authenticates the request with Calculate an RFC
  # 2104-compliant HMAC. We build a string to sign that includes the query
  # parameters ordered by the lexical order of the parameter names.
  # 
  # Here we sort the query parameter names and create an array of URL encoded
  # query name value pairs.
  names = for key, value of map
    key
  names.sort()

  query = []
  for name in names
    query.push(querystring.escape(name) + "=" + querystring.escape(map[name]))

  # The string includes the request verb, server, request path and the query
  # string sorted by the lexical order of the parameter names.
  toSign = "GET\n" +
    "ec2.amazonaws.com\n" +
    "/\n" +
    query.join("&")

  # Generate the HMAC.
  hmac = crypto.createHmac "sha256", process.env["AWS_SECRET_ACCESS_KEY"]
  hmac.update toSign
  digest = querystring.escape(hmac.digest("base64"))

  # Add the HMAC to the query string.
  query.push "Signature=" + digest

  # Connect to the Amazon Query API server, gather the response, and feed it to
  # the callback function.
  client = http.createClient 443, "ec2.amazonaws.com", true
  headers = { host: "ec2.amazonaws.com" }
  request = client.request "GET", ("/?" + query.join("&")), headers
  request.end()
  request.on "response", (response) ->
    body = ""
    response.setEncoding "utf8"
    response.on "data", (chunk) ->
      body += chunk
    response.on "end", () ->
      callback response, body
  true

module.exports.invoke = invoke
