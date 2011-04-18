# The **ResponseParser** class parses an Amazon Query API response converting
# the XML response to a JSON object. The parser makes assumptions about the
# structure of the XML.
#
# * The XML will have no mixed content.
# * Certain element names and naming conventions denote certain data types.
# * An empty element, one containing only whitespace, is either a null object
#   member or an empty set.
#
# With these assumptions, we convert the XML document into a direct JSON
# object representation. Because the JSON representation is a direct
# represntation of the XML, the client can use the Amazon Query API
# documentation as a reference for query results.

# Require libxml.
libxml = require "libxmljs"

# Matches a timestamp in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601)
# format.
isTimestamp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d*)Z/

class ResponseParser

  # Construct a new reponse parser which is based on a **SaxParser**.
  constructor: () ->
    accumulator = []
    depth = 0
    names = []
    @sax = new libxml.SaxParser (sax) =>

      # We push collections onto the stack at start and reset the accumulator.
      sax.onStartElementNS (elem) =>

        # When the element name is `item` or `Error` the parent is a list of
        # items or errors, so we create a list if it does not exist.
        if /^item|Error$/.test(elem)
          if @branches.length != depth
            @branches.push([])
          names.push(elem)

        # Otherwise, when the depth is greater than one, the parent element
        # defines a container, so we create an object if it does not exist.
        else if depth != 0
          if depth > 1 && @branches.length != depth
            @branches.push({})
          names.push(elem)

        # Reset acculator and increment depth.
        accumulator.length = 0
        depth++

      # We assign collections and values to their parent collections on end.
      sax.onEndElementNS (elem) =>

        # When `depth` is zero we are done.
        if --depth == 0
          @callback null, @base

        # When we encouter an element named item or Error, we have completed an
        # array element, so we push it onto the parent array element.
        else if /^item|Error$/.test(names[depth - 1])
          map = @branches.pop()
          @branches[@branches.length - 1].push(map)
          names.pop()

        # Otherwise, if we created an object or array at this level, we assign
        # it to the parent object using the element name as key.
        else if @branches[depth]
          map = @branches.pop()
          @branches[@branches.length - 1][names.pop()] = map

        # When we encounter an element that contains only text, we know that
        # this is either
        #
        #  1. a scalar member of a object, where the element name is the key,
        #     and the text is the value. 
        #  2. an empty list.
        #
        # If the accumulator has not gathered any text, then it is either a null
        # scalar value or an empty list, depending on the name.
        #
        # If the name ends with `Time` we convert to date, if it ends with
        # `size` we convert to integer, if the name is `return` and looks
        # boolean then we convert to boolean.
        else
          name = names.pop()
          if accumulator.length == 0
            value = null
            if name == "Errors" || /Set$/.test(name)
              value = []
          else
            value = accumulator.join("")
            if /Time$/.test(name)
              match = isTimestamp.exec(value)
              if match
                match = match.slice(1).map (part) -> parseInt(part, 10)
                match[1]--
                value = new Date(Date.UTC.apply(null, match))
            if /size$/i.test(name)
              value = parseInt(value, 10)
            if name == "return" and /^true|false$/.test(value)
              value = value == "true"
          @branches[@branches.length - 1][name] = value
          accumulator.length = 0

      # We don't gather text if it is only whitspace.
      sax.onCharacters (chars) ->
        if accumulator.length is 0 and /\S/.test(chars)
          accumulator.push(chars)

      # Errors are reported to our caller.
      sax.onError (msg) =>
        @callback new Error(msg), null

  # Parses the Amazon Query API response `text` and invokes the `callback` with
  # the generated JSON object or with any errors encountered.
  read: (text, callback) ->
    @base = {}
    @branches = [ @base ]
    @callback = callback || () ->
    @sax.parseString(text)

# Export **ResponseParser**.
module.exports.ResponseParser = ResponseParser
