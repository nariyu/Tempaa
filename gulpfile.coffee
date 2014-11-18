
# require modules
gulp        = require 'gulp'
loadPlugins = require 'gulp-load-plugins'
runSequence = require 'run-sequence'
$ = loadPlugins()
del         = require 'del'
open        = require 'open'

# Clean
gulp.task 'clean', (cb)->
  del 'dist', cb

# JavaScript
gulp.task 'js', ->
  gulp.src 'src/**/*.coffee'
    .pipe $.coffee()
    .pipe gulp.dest 'dist'

# JavaScript .min
gulp.task 'js-min', ->
  gulp.src 'src/**/*.coffee'
    .pipe $.rename (path)->
      path.basename += ".min"
      return
    .pipe $.coffee()
    .pipe $.uglify()
    .pipe gulp.dest 'dist'

# Watch
gulp.task 'watch', ->
  gulp.watch 'src/**/*.{coffee,js,json,cson}', ['js', 'js-min']

# Web Server
gulp.task 'webserver', ->
  gulp.src '.'
    .pipe $.webserver
      host: '0.0.0.0'
      port: 3000
      # livereload: true

# Open Browser
gulp.task 'open', ->
  open 'http://localhost:3000/examples/'


###
  Tasks
###

# Default Task (None)
gulp.task 'default', -> ''

# Development
gulp.task 'develop', ->
  runSequence 'clean', ['js', 'js-min'], 'watch', 'webserver', 'open'

# Build
gulp.task 'build', ->
  runSequence 'clean', ['js', 'js-min']
