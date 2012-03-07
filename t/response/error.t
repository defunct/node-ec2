#!/usr/bin/env _coffee
require("./harness") 1, ({ parse }, _) ->
  object = parse "Errors", _
  expected =
    Errors: [ { Code: 'MissingParameter', Message: 'The request must\ncontain the parameter\nMinCount' } ]
    RequestID: '2258815d-0be5-4491-b199-673aec77dfe3'
  @deepEqual expected, object, "parse errors"
