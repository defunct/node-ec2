#!/usr/bin/env coffee
response = require "../../lib/response"
fs = require "fs"
parse = (name, callback) ->
  parser = new response.ResponseParser()
  parser.read fs.readFileSync(__dirname + "/responses/" + name, "utf8"), callback
module.exports = require("ace.is.aces.in.my.book")({ parse })
