fs = require "fs"
ec2 = require "ec2"

argv = process.argv.slice 2

command = argv.shift()

parameters = {}
while argv.length
  key = argv.shift()
  if match = /^\s*\+(.*)/.exec key
    format = match[1]
  else
    parameters[key] = argv.shift()

build = (fields, child) ->
  (lines, line, context) ->
    for item in context
      copy = line.slice 0
      for field, n in fields
        if child and n is fields.length - 1
          child(lines, copy, item[field])
        else
          copy.push item[field]
      if not child
        lines.push copy

parse = (labels, rest, nested) ->
  fields = []
  while not proc
    if nested and match = /^\s*\](.*)$/.exec rest
      rest = match[1]
      proc = build(fields, null)
    else
      match = /^\s*(\w[\w\d]*)(.*)$/.exec rest
      if not match
        throw new Error "invalid pattern"
      [ field, rest ] = match.slice 1
      label = field
      if match = /^\[(.*)$/.exec rest
        fields.push field
        [ child, rest ] = parse(labels, match[1], true)
        proc = build(fields, child)
      else
        if match = /^\/(\w[\w\d]*)$/.exec rest
          [ label, rest ] = match.slice 1
        labels.push label
        fields.push field
        rest = rest.replace /^\s*,/, ''
  [ proc, rest ]

labels = []
if format
  [ display, rest ] = parse(labels, format)
  if rest and rest.trim().length isnt 0
    throw new Error "invalid pattern."

file = process.env["AWS_CONFIG"] or "#{process.env["HOME"]}/.aws"
configuration = JSON.parse fs.readFileSync file, "utf8"
client = ec2.createClient configuration

client.on "error", (error) ->
  console.log "error", error
  throw error

client.call command, parameters, (response) ->
  if display
    lines = []
    display lines, [], [ response ]
    for line in lines
      process.stdout.write line.join " "
      process.stdout.write "\n"
  else
    process.stdout.write JSON.stringify response, null, 2
    process.stdout.write "\n"

client.execute()
