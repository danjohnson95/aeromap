var gulp 		= require('gulp');
	sass 		= require('gulp-sass'),
	browserify 	= require('browserify'),
	source 		= require('vinyl-source-stream'),
	buffer     	= require('vinyl-buffer'),
	uglify 		= require('gulp-uglify'),
	jsonminify 	= require('gulp-jsonminify'),
	fs 			= require('fs'),
	del 		= require('del'),

	i 			= './src',
	o 			= './dist',
	buildTime	= new Date().getTime(),
	sassFiles 	= [i+'/scss/**/*.scss'],
	jsFiles 	= i+'/js/app.js',
	fontFiles 	= i+'/fonts/*',
	jsonFiles 	= i+'/json/*',
	iconFiles 	= i+'/img/icons/*',
	imgFiles 	= [i+'/img/*', '!+'+i+'/img/icons/*'],

	sassTask = function(){
		return gulp.src(sassFiles)
	    	.pipe(sass({outputStyle: 'compressed'}))
    		.pipe(gulp.dest(o+'/css'));
	},

	jsTask = function(){
		var b = browserify({
			entries: jsFiles
		});

		return b.bundle()
	      .pipe(source('app.js'))
	      .pipe(buffer())
	      .pipe(uglify())
	      .pipe(gulp.dest(o+'/js'));
	},

	fontsTask = function(){
		return gulp.src(fontFiles, {base: i+'/fonts'})
			.pipe(gulp.dest(o+'/fonts'));
	},

	jsonTask = function(){
		return gulp.src(jsonFiles, {base: i+'/json'})
			//.pipe(jsonminify())
			.pipe(gulp.dest(o+'/json'));
	},

	imgTask = function(){
		return gulp.src(imgFiles, {base: i+'/img'})
			.pipe(gulp.dest(o+'/img'));
	},

	watchTask = function(){
		gulp.watch(sassFiles, ['sass']);
		gulp.watch(jsFiles, ['js']);
		gulp.watch(fontFiles, ['fonts']);
		gulp.watch(jsonFiles, ['json']);
		gulp.watch(imgFiles, ['img']);
	},

	rebuildManifest = function(){
		fs.writeFileSync('./manifest.mf', 'CACHE MANIFEST \r#'+buildTime+'\r'+o+'\r./favicon.ico\r./index.html');
	},

	clean = function(){
		return del(o+'/*');
	},

	logError = function(e){
		console.log(e);
	};

	gulp.task('watch', watchTask);
	gulp.task('sass', sassTask);
	gulp.task('js', jsTask);
	gulp.task('fonts', fontsTask);
	gulp.task('json', jsonTask);
	gulp.task('img', imgTask);
	gulp.task('manifest', rebuildManifest);
	gulp.task('rebuild', ['clean', 'build']);
	gulp.task('clean', clean);
	gulp.task('build', ['js', 'sass', 'fonts', 'json', 'img', 'manifest']);

	gulp.task('default', ['build', 'watch']);




