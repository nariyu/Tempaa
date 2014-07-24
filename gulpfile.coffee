
# require modules
gulp        = require 'gulp'
loadPlugins = require 'gulp-load-plugins'
runSequence = require 'run-sequence'
$ = loadPlugins()

# Clean
gulp.task 'clean', ->
  gulp.src 'dist'
    .pipe $.clean()

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
  gulp.watch 'src/**/*.{coffee,js,json,cson}', ['js']

# Web Server
gulp.task 'webserver', ->
  gulp.src '.'
    .pipe $.webserver
      host: '0.0.0.0'
      port: 3000
      livereload: true

# Open Browser
gulp.task 'open', ->
  gulp.src 'examples/index.html'
    .pipe $.open '', url: 'http://localhost:3000/examples/'


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
