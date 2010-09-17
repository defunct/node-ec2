fs = require("fs")

task "develop", "Create a development environment for node-ec2", () ->
  gitignore = '''
              .DS_Store
              **/.DS_Store
              lib
              docs
              '''
  fs.writeFile(".gitignore", gitignore)
