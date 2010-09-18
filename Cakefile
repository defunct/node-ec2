fs              = require("fs")
{exec, spawn}   = require("child_process")

currentBranch = (callback) ->
  branches =      ""
  git =           spawn "git", [ "branch" ]
  git.stdout.on   "data", (buffer) -> branches += buffer.toString()
  git.stderr.on   "data", (buffer) -> puts buffer.toString()
  git.on          "exit", (status) ->
    process.exit(1) if status != 0
    branch = /\*\s+(.*)/.exec(branches)[1]
    callback(branch)

task "gitignore", "create a .gitignore for node-ec2 based on git branch", () ->
  currentBranch (branch) ->
    gitignore = '''
                .gitignore
                .DS_Store
                **/.DS_Store
                
                '''

    if branch is "master"
      gitignore += '''
                   documentation
                   lib
                   '''
    fs.writeFile(".gitignore", gitignore)

task "docco", "rebuild the CoffeeScript docco documentation.", ->
  exec "docco src/*.coffee && cp -rf docs documentation && rm -r docs", (err) ->
    throw err if err

task "clean", "rebuild the CoffeeScript docco documentation.", ->
  currentBranch (branch) ->
    if branch isnt "master"
      exec "rm -rf documentation", (err) ->
        throw err if err
