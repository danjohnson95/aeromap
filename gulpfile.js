var gulp 		= require('gulp');
	sass 		= require('gulp-sass'),
	browserify 	= require('browserify'),
	source 		= require('vinyl-source-stream'),
	buffer     	= require('vinyl-buffer'),
	uglify 		= require('gulp-uglify'),
	jsonminify 	= require('gulp-jsonminify'),
	fs 			= require('fs'),
	del 		= require('del'),
	manifest 	= require('gulp-manifest'),
	favicons 	= require('gulp-favicons'),

	i 			= './src',
	o 			= './dist',
	npm			= './node_modules',
	buildTime	= new Date().getTime(),
	sassFiles 	= [i+'/scss/**/*.scss'],
	jsFiles 	= [i+'/js/app.js'],
	fontFiles 	= i+'/fonts/*',
	jsonFiles 	= [i+'/json/*'],
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
	      //.pipe(uglify())
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

	faviconTask = function(){
		return gulp.src(iconFiles).pipe(favicons({
			appName: 'aeromap',
			appDescription: 'An offline-accessible world map with your GPS location plotted on, so you can see where you are during a flight',
			developerName: 'Dan Johnson',
			developerURL: 'http://danj.eu',
			background: '#51526f',
			path: 'src/img/icons',
			url: 'https://aeromap.xyz',
			display: 'standalone',
			orientation: 'portrait',
			start_url: 'index.html',
			version: 0.1,
			logging: false,
			online: false,
			html: 'index.html',
			pipeHTML: true,
			replace: true
		}))
		.on('error', logError)
		.pipe(gulp.dest('./'));
	}

	watchTask = function(){
		gulp.watch(sassFiles, ['sass']);
		gulp.watch(jsFiles, ['js']);
		gulp.watch(fontFiles, ['fonts']);
		gulp.watch(jsonFiles, ['json']);
		gulp.watch(imgFiles, ['img']);
	},

	rebuildManifest = function(){
		gulp.src(['dist/**/*', 'index.html', 'favicon.ico', 'marker.png'], { base: './'})
	    .pipe(manifest({
	      hash: true,
	      preferOnline: true,
	      network: ['*'],
	      filename: 'manifest.mf'
	     }))
	    .pipe(gulp.dest('./'));
	},

	clean = function(){
		return del(o+'/*');
	},

	logError = function(e){
		console.log(e);
	};

	gulp.task('watch', watchTask);
	gulp.task('sass', ['manifest'], sassTask);
	gulp.task('js', ['manifest'], jsTask);
	gulp.task('fonts', ['manifest'], fontsTask);
	gulp.task('json', ['manifest'], jsonTask);
	gulp.task('img', ['manifest'], imgTask);
	gulp.task('favicons', ['manifest'], faviconTask);
	gulp.task('manifest', rebuildManifest);
	gulp.task('rebuild', ['clean', 'build']);
	gulp.task('clean', clean);
	gulp.task('build', ['js', 'sass', 'fonts', 'json', 'img', 'manifest']);

	gulp.task('default', ['build', 'watch']);




