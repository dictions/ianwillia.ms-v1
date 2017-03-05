'use strict';

var express = require('express'),
	 tinylr = require('tiny-lr'),
	   path = require('path'),
	   gulp = require('gulp'),
	  gutil = require('gulp-util'),
	replace = require('gulp-replace'),
	   less = require('gulp-less'),
	   styl = require('gulp-styl'),
	 concat = require('gulp-concat'),
	 uglify = require('gulp-uglify'),
	 rename = require('gulp-rename'),
   imagemin = require('gulp-imagemin'),
     jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
	ghPages = require('gulp-gh-pages');

// Deployment
gulp.task('deploy', function() {
	return gulp.src(['./build/**/*', './CNAME'])
	.pipe(ghPages());
});

// Less preprocessing and minification
gulp.task('less', function() {
	gulp.src('src/styles/main.less')
	.pipe(less())
	.pipe(gulp.env.production ? styl({compress: true}) : gutil.noop())
	.pipe(gulp.env.production ? rename('main.min.css') : gutil.noop())
	.pipe(gulp.env.production ? gulp.dest('build/styles') : gulp.dest('src/tmp/styles'));
	gulp.src('src/styles/explosion.less')
	.pipe(less())
	.pipe(gulp.env.production ? styl({compress: true}) : gutil.noop())
	.pipe(gulp.env.production ? rename('explosion.min.css') : gutil.noop())
	.pipe(gulp.env.production ? gulp.dest('build/styles') : gulp.dest('src/tmp/styles'));
});

// Javascript processing
gulp.task('lint', function(){
	gulp.src('src/js/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter(stylish))
	.pipe(concat('main.js'))
	.pipe(uglify())
	.pipe(rename('main.min.js'))
	.pipe(gulp.dest('build/js'));
})

// Image processing
gulp.task('imagemin', function() {
	gulp.src('src/img/**')
	.pipe(imagemin())
	.pipe(gulp.dest('build/img'));
})

// HTML processing
gulp.task('html-replace', function() {
	gulp.src('src/index.html')
	.pipe(replace('jquery.js', 'jquery.min.js'))
	.pipe(replace('main.js', 'main.min.js'))
	.pipe(replace('main.css', 'main.min.css'))
	.pipe(replace('explosion.css', 'explosion.min.css'))
	.pipe(gulp.dest('build'));
});

// Express Server
var createServers = function(port, lrport) {
	var lr = tinylr();
	lr.listen(lrport, function() {
		gutil.log('LR Listening on', lrport);
	});

	var app = express();
	// First check tmp directory, then check src for assets
	app.use(express.static(path.resolve('src/tmp')));
	app.use(express.static(path.resolve('src')));
	app.listen(port, function() {
		gutil.log('Listening on', port);
	});

	return {
		lr: lr,
		app: app
	};
};

/*
	REGISTER GULP CI
*/

gulp.task('watch', function(){
	// Start and watch dev servers – LiveReload plugin required
	var servers = createServers(8080, 35729);

	// generate initial css in tmp directory
	gulp.run('less');

	// watch and process less
	gulp.watch('src/styles/*.less', function(event){
		gulp.run('less');
		gutil.log(gutil.colors.cyan(event.path), 'changed');
		servers.lr.changed({
			body: {
				files: [event.path]
			}
		});
	});
	// watch html for changes
	gulp.watch(['src/*.html'], function(event){
		gutil.log(gutil.colors.cyan(event.path), 'changed');
		servers.lr.changed({
			body: {
				files: [event.path]
			}
		});
	});
	// watch js for changes
	gulp.watch(['src/js/*.js'], function(event){
		gutil.log(gutil.colors.cyan(event.path), 'changed');
		servers.lr.changed({
			body: {
				files: [event.path]
			}
		});
	});
});



gulp.task('build', function(){
	// remove need for --production flag
	gulp.env.production = true;

	// compress css, javascript, and images
	// replace tags with minified versions
	gulp.run('less', 'imagemin', 'lint', 'html-replace');

	// copy library js
	gulp.src('src/lib/**/*.min.js')
	.pipe(gulp.dest('build/lib'));
	gulp.src('src/lib/**/*.js')
	.pipe(gulp.dest('build/lib'));
	// copy library css
	gulp.src('src/lib/**/*.css')
	.pipe(gulp.dest('build/lib'));

})