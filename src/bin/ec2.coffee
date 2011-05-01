ec2 = require "ec2"

argv = process.argv.slice 2

command = argv.shift()

parameters = {}
while argv.length
  key = argv.shift()
  parameters[key] = argv.shift()

client = ec2.createClient
  key: process.env["AWS_ACCESS_KEY_ID"]
  secret: process.env["AWS_SECRET_ACCESS_KEY"]

client.on "error", (error) ->
  console.log "error", error
  throw error

client.call command, parameters, (response) ->
  process.stdout.write JSON.stringify response, null, 2
  process.stdout.write "\n"

client.execute()
