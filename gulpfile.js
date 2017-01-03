var gulp 				= require('gulp'),
    concat 				= require('gulp-concat'),
    uglify 				= require('gulp-uglify'),
	ignore 				= require('gulp-ignore'),
	rimraf 				= require('gulp-rimraf'),
    rename 				= require('gulp-rename'),
    sass 				= require('gulp-ruby-sass'),
	ngAnnotate 			= require('gulp-ng-annotate'),
    autoprefixer 		= require('gulp-autoprefixer'),
    htmlmin 			= require('gulp-htmlmin'),
	zip 				= require('gulp-zip'),	
	runSequence  		= require('run-sequence'), // 'hack' that should be removed when gulp 4 is out
	notify 				= require("gulp-notify"),
    browserSync 		= require('browser-sync').create();

var BUILD_DEST = 'build/',
	DEV_DEST = 'dev/',
	SRC_PATH = 'src/',
	node_modules = 'bower_components/',
	node_modules = 'node_modules/',
	vendorPath = BUILD_DEST + 'vendors',
	vendorPathDev = DEV_DEST + 'vendors';

// loaded onto the page as-is, use minified when possible or minify before moving to build via gulp process
var js_paths = {
    jquery: {
        src: node_modules + 'jquery/dist/jquery.min.js',
        dest: "/jquery"
    },
    bootstrap: {
        src: node_modules + 'bootstrap/dist/js/bootstrap.min.js',
        dest: "/bootstrap"
    },
	chartjs: {
        src: node_modules + 'chart.js/dist/Chart.min.js',
        dest: "/chart.js"
	},
	angular: {
        src: node_modules + 'angular/angular.min.js',
        srcmap: node_modules + 'angular/angular.min.js.map',
        dest: "/angular"
	},
	angularuibootstrap: {
        src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
       // srcmap: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js.map',
        dest: "/angular-ui-bootstrap"
	},
	//angular-animate
	nganimate: {
		src: node_modules + 'angular-animate/angular-animate.min.js',
		srcmap: node_modules + 'angular-animate.min.js.map',
		dest: "/angular-animate"
	},
	//angular-animate
	angular_chart_js: {
		src: node_modules + 'angular-chart.js/dist/angular-chart.min.js',
		srcmap: node_modules + 'angular-chart.js/dist/angular-chart.min.js.map',
		dest: "/angular-chart.js"
	},
	angular_cookies: {
		src: node_modules + 'angular-cookies/dist/angular-cookies.min.js',
		srcmap: node_modules + 'angular-cookies/dist/angular-cookies.min.js.map',
		dest: "/angular-cookies"
	},
	angular_route: {
		src: node_modules + 'angular-route/angular-route.min.js',
		srcmap: node_modules + 'angular-route/angular-route.min.js.map',
		dest: "/angular-route"
	},
	//angular-ui-bootstrap in npm
	angular_bootstrap: {
		src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
		dest: "/angular-ui-bootstrap"
	},
	angular_route: {
		src: node_modules + 'angular-route/angular-route.min.js',
		srcmap: node_modules + 'angular-route/angular-route.min.js.map',
		dest: "/angular-route"
	},
	nprogress: {
		src: node_modules + 'nprogress/nprogress.js',
		dest: "/nprogress"
	},
	ngprogress: {
		src: node_modules + 'ngprogress/build/ngprogress.js',
		dest: "/ngprogress"
	},
	ngtable: {
		src: node_modules + 'ng-table/dist/ng-table.min.js',
		srcmap: node_modules + 'ng-table/dist/ng-table.min.js.map',
		dest: "/ng-table"
	},
	ngfileupload: {
		src: node_modules + 'ng-file-upload/dist/ng-file-upload.min.js',
		dest: "/ng-file-upload"
	},
	ngfileuploadshim: {
		src: node_modules + 'ng-file-upload/dist/ng-file-upload-shim.min.js',
		dest: "/ng-file-upload"
	}
};

var css_paths = {
	angular_bootstrap: {
        src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
       // srcmap: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js.map',
        dest: "/angular-ui-bootstrap"
	},
    bootstrap: {
        src: node_modules + 'bootstrap/dist/css/bootstrap.min.css',
        srcmap: node_modules + 'bootstrap/dist/css/bootstrap.min.css.map',
        fonts: node_modules + 'bootstrap/dist/fonts/*',
        dest: "/bootstrap"
    },
	nprogress: {
        src: node_modules + 'nprogress/nprogress.css',//currently unused, it's loaded into the main styles.scss
        dest: "/nprogress"
	},
	ngprogress: {
        src: node_modules + 'ngprogress/ngProgress.css',
        dest: "/ngprogress"
	},
	ngtable: {
		src: node_modules + 'ng-table/dist/ng-table.min.css',
		srcmap: node_modules + 'ng-table/dist/ng-table.min.css.map',
		dest: "/ng-table"
	},
	animatecss: {
		src: node_modules + 'animate.css/animate.min.css',
		dest: "/animate.css"
	}
};

// jquery
gulp.task('jquery', function () {
    return gulp.src(js_paths.jquery.src)
        .pipe(gulp.dest(vendorPath + js_paths.jquery.dest))
		.pipe(gulp.dest(vendorPathDev + js_paths.jquery.dest))
});

// angular
gulp.task('angular', function () {
    return gulp.src([
		js_paths.angular.src,
		js_paths.angular.srcmap])
        .pipe(gulp.dest(vendorPath + js_paths.angular.dest))
		.pipe(gulp.dest(vendorPathDev + js_paths.angular.dest))
});

// animations via animate.css
gulp.task('animatecss', function () {
    return gulp.src(css_paths.animatecss.src)
        .pipe(gulp.dest(vendorPath + css_paths.animatecss.dest))
		.pipe(gulp.dest(vendorPathDev + css_paths.animatecss.dest))
});

// bootstrap deps
gulp.task('bootstrap_js', function () {
    return gulp.src(js_paths.bootstrap.src)
        .pipe(gulp.dest(vendorPath + js_paths.bootstrap.dest))
		.pipe(gulp.dest(vendorPathDev + js_paths.bootstrap.dest))
});
gulp.task('bootstrap_css', function () {
    return gulp.src([
		css_paths.bootstrap.src,
		css_paths.bootstrap.srcmap])
        .pipe(gulp.dest(vendorPath + css_paths.bootstrap.dest))
        .pipe(gulp.dest(vendorPathDev + css_paths.bootstrap.dest))
});
gulp.task('bootstrap_fonts', function(){
	return gulp.src(css_paths.bootstrap.fonts)
	    .pipe(gulp.dest(vendorPath + "/fonts/"))
	    .pipe(gulp.dest(vendorPathDev + "/fonts/"))
});
//			js_paths.angular_bootstrap.src,
gulp.task('angular_bootstrap', function () {
    return gulp.src(js_paths.angular_bootstrap.src)
        .pipe(gulp.dest(vendorPath + js_paths.angular_bootstrap.dest))
		.pipe(gulp.dest(vendorPathDev + js_paths.angular_bootstrap.dest))
});
// angular_bootstrapcss
gulp.task('angular_bootstrap_css', function () {
    return gulp.src([
		css_paths.angular_bootstrap.src])
        .pipe(gulp.dest(vendorPath + css_paths.angular_bootstrap.dest))
		.pipe(gulp.dest(vendorPathDev + css_paths.angular_bootstrap.dest))
});


gulp.task('bootstrap', ['bootstrap_js','bootstrap_css','bootstrap_fonts','angular_bootstrap','angular_bootstrap_css']);

// nprogress, raw JS
gulp.task('nprogress_js', function () {
    return gulp.src(js_paths.nprogress.src)
        .pipe(gulp.dest(vendorPath + js_paths.nprogress.dest))
        .pipe(gulp.dest(vendorPathDev + js_paths.nprogress.dest))
});
gulp.task('nprogress_css', function () {
    return gulp.src(css_paths.nprogress.src)
        .pipe(gulp.dest(vendorPath + css_paths.nprogress.dest))
        .pipe(gulp.dest(vendorPathDev + css_paths.nprogress.dest))
});
// ngprogress = angular implementation
gulp.task('ngprogress', function() {
    return gulp.src(js_paths.ngprogress.src)
		.pipe(gulp.dest(SRC_PATH	+'js/app/vendors/'));//will be bundled into main app JS during optimization
});
gulp.task('nprogress', ['nprogress_js','nprogress_css']);

gulp.task('ngtable', function() {
    return gulp.src(css_paths.ngtable.src)
        .pipe(gulp.dest(vendorPath + css_paths.ngtable.dest))
        .pipe(gulp.dest(vendorPathDev + css_paths.ngtable.dest))
});



// run through all vendor deps. These should've been installed with bower beforehand
gulp.task('vendors', ['jquery','animatecss','angular','bootstrap','nprogress','ngtable']);

// seems duplicate of js_dependencies_angular?

gulp.task('js_dependencies_angular', function () {
	return gulp.src([
			js_paths.angular_route.src,
			js_paths.nganimate.src,
			//js_paths.angular_cookies.src,
			//node_modules + 'ng-json-explorer/dist/angular-json-explorer.min.js',
			js_paths.ngprogress.src,
			js_paths.chartjs.src,
			js_paths.angular_chart_js.src,
			js_paths.ngtable.src,
			js_paths.ngfileupload.src,
			js_paths.ngfileuploadshim.src,
			js_paths.angular_bootstrap.src
		])

		.pipe(ngAnnotate().on('error', function(e){
			console.log("ngAnnotate failed: ",e);
		}))
		.pipe(concat('deps.min.js').on('error', function(e){
			console.log("concat failed: ",e);
		}))
		.pipe(gulp.dest(DEV_DEST+'/js'))
/*
		.pipe(uglify({
			
		}).on('error', function(e){
			console.log(e);
		}))//*/
		.pipe(gulp.dest(BUILD_DEST+'/js'))
		.pipe(browserSync.stream());
});

gulp.task('js_scripts', function() {
    return gulp.src([
			SRC_PATH + 'js/*.js',
			SRC_PATH + 'js/app/**/*.js'
		])
		.pipe(concat('app.min.js'))
		.pipe(ngAnnotate().on('error', function(e){
			console.log("ngAnnotate failed: ",e);
		}))
		.pipe(gulp.dest(DEV_DEST+'/js'))
		.pipe(uglify({
			compress: {
				drop_debugger: true,
				dead_code: false
			}
		}).on('error', function(e){
			console.log("uglify failed: ",e);
		}))//*/
		.pipe(gulp.dest(BUILD_DEST+'/js'))
		.pipe(browserSync.stream());
});


gulp.task('html', function() {
	return gulp.src([SRC_PATH + '**/*.html'])
		.pipe(gulp.dest(DEV_DEST))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(BUILD_DEST))
		.pipe(browserSync.stream());
})

var compileSASS = function (filename, options) {
  return sass(SRC_PATH + 'scss/**/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(BUILD_DEST+'/css'))
        .pipe(gulp.dest(DEV_DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass', function() {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function() {
    return compileSASS('custom.min.css', {style: 'compressed'});
});

// PHP task just copies source to two destinations
gulp.task('php', function() {
	return gulp.src([
		SRC_PATH + 'API/**.php',
		SRC_PATH + 'API/.htaccess'
	])
    .pipe(gulp.dest(BUILD_DEST	+'API'))
    .pipe(gulp.dest(DEV_DEST	+'API'))
    .pipe(browserSync.stream());
});

// Remove all processed files in dev and build folders.
gulp.task('clean', function() {
 	return gulp.src([
			'build.zip',
			BUILD_DEST + '/**/*.js',
			DEV_DEST + '/**/*.js',
			BUILD_DEST + '/**/*.html',
			DEV_DEST + '/**/*.html',
			BUILD_DEST + '/**/*.css',
			DEV_DEST + '/**/*.css',
			BUILD_DEST + '/**/*.map',
			DEV_DEST + '/**/*.map',
			BUILD_DEST + '/**/*.php',
			DEV_DEST + '/**/*.php',
			BUILD_DEST + '/vendors/**/*',
			DEV_DEST + '/vendors/**/*',
			'**/.DS_Store'
		], { read: false }) // much faster
		 //Ignore a few folders
 		.pipe(ignore('src/**'))
 		.pipe(ignore('node_modules/**'))
 		.pipe(ignore('dev_old/**')) 
 		.pipe(ignore('.git/**'))
		
 		.pipe(rimraf({ force: true }));
		
		cache.caches = {};
		
// 		.pipe(notify({ message: 'Clean task complete', onLast: true }));
});

gulp.task('zip', function () {
	return gulp.src(BUILD_DEST+'/**/',{dot: true})
		.pipe(zip('build.zip'))
        .pipe(ignore('**/chart.php'))
        .pipe(ignore('**/test.php'))
		.pipe(gulp.dest('./'))
		.pipe(notify({ message: 'Build process complete', onLast: true }));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './dev'
    });
});
// ######## main tasks ########
gulp.task('watch', function() {
	// Watch .html files
	gulp.watch(SRC_PATH + '**/*.html', ['html']);
	
	// Watch .php API resources
	gulp.watch(SRC_PATH + 'API/*.php', ['php']);
	
	// Watch .js files
	gulp.watch(SRC_PATH + 'js/*.js', ['js_scripts']);
	gulp.watch(SRC_PATH + 'js/app/**/*.js', ['js_scripts']);
	
	// too slow to just feed that through, too many files there.
	//gulp.watch(node_modules + '**/*.js', ['js_dependencies_angular']);
	
	// Watch .scss files
	gulp.watch(SRC_PATH + 'scss/*.scss', ['sass', 'sass-minify']);
});

// need run sequence, or everything will happen in parallel, meaning the zip process could happen before all files are ready
gulp.task('build', function(done) {
    return runSequence('clean','sass','sass-minify','vendors', 'html', 'php','js_dependencies_angular','js_scripts','zip', function() {
        done();
    });
});

//gulp.task('build', ['sass','sass-minify','vendors', 'html', 'php','js_dependencies_angular','js_scripts','zip'])
// Default Task
gulp.task('default', ['build','watch','browser-sync']);