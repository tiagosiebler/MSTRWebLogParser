const { task, dest, series, src, watch, parallel } = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ignore = require('gulp-ignore');
const rimraf = require('gulp-rimraf');
const sass = require('gulp-ruby-sass');
const ngAnnotate = require('gulp-ng-annotate');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const zip = require('gulp-zip');
const notify = require('gulp-notify');
const browserSync = require('browser-sync').create();

const BUILD_DEST = 'build/';
const DEV_DEST = 'dev/';
const SRC_PATH = 'src/';

const node_modules = 'node_modules/';
const vendorPath = BUILD_DEST + 'vendors';
const vendorPathDev = DEV_DEST + 'vendors';

const srcOptions = {
  allowEmpty: true
};

// loaded onto the page as-is, use minified when possible or minify before moving to build via gulp process
var js_paths = {
  jquery: {
    src: node_modules + 'jquery/dist/jquery.min.js',
    dest: '/jquery'
  },
  bootstrap: {
    src: node_modules + 'bootstrap/dist/js/bootstrap.min.js',
    dest: '/bootstrap'
  },
  chartjs: {
    src: node_modules + 'chart.js/dist/Chart.min.js',
    dest: '/chart.js'
  },
  angular: {
    src: node_modules + 'angular/angular.min.js',
    srcmap: node_modules + 'angular/angular.min.js.map',
    dest: '/angular'
  },
  angularuibootstrap: {
    src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    // srcmap: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js.map',
    dest: '/angular-ui-bootstrap'
  },
  //angular-animate
  nganimate: {
    src: node_modules + 'angular-animate/angular-animate.min.js',
    srcmap: node_modules + 'angular-animate.min.js.map',
    dest: '/angular-animate'
  },
  //angular-animate
  angular_chart_js: {
    src: node_modules + 'angular-chart.js/dist/angular-chart.min.js',
    srcmap: node_modules + 'angular-chart.js/dist/angular-chart.min.js.map',
    dest: '/angular-chart.js'
  },
  angular_cookies: {
    src: node_modules + 'angular-cookies/dist/angular-cookies.min.js',
    srcmap: node_modules + 'angular-cookies/dist/angular-cookies.min.js.map',
    dest: '/angular-cookies'
  },
  angular_route: {
    src: node_modules + 'angular-route/angular-route.min.js',
    srcmap: node_modules + 'angular-route/angular-route.min.js.map',
    dest: '/angular-route'
  },
  //angular-ui-bootstrap in npm
  angular_bootstrap: {
    src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    dest: '/angular-ui-bootstrap'
  },
  nprogress: {
    src: node_modules + 'nprogress/nprogress.js',
    dest: '/nprogress'
  },
  ngprogress: {
    src: node_modules + 'ngprogress/build/ngprogress.js',
    dest: '/ngprogress'
  },
  ngtable: {
    src: node_modules + 'ng-table/dist/ng-table.min.js',
    srcmap: node_modules + 'ng-table/dist/ng-table.min.js.map',
    dest: '/ng-table'
  },
  ngfileupload: {
    src: node_modules + 'ng-file-upload/dist/ng-file-upload.min.js',
    dest: '/ng-file-upload'
  },
  ngfileuploadshim: {
    src: node_modules + 'ng-file-upload/dist/ng-file-upload-shim.min.js',
    dest: '/ng-file-upload'
  },
  colresizable: {
    src: node_modules + 'colresizable/colResizable-1.6.min.js',
    dest: '/colresizable'
  }
};

var css_paths = {
  angular_bootstrap: {
    src: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
    // srcmap: node_modules + 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js.map',
    dest: '/angular-ui-bootstrap'
  },
  bootstrap: {
    src: node_modules + 'bootstrap/dist/css/bootstrap.min.css',
    srcmap: node_modules + 'bootstrap/dist/css/bootstrap.min.css.map',
    fonts: node_modules + 'bootstrap/dist/fonts/*',
    dest: '/bootstrap'
  },
  nprogress: {
    src: node_modules + 'nprogress/nprogress.css', //currently unused, it's loaded into the main styles.scss
    dest: '/nprogress'
  },
  ngprogress: {
    src: node_modules + 'ngprogress/ngProgress.css',
    dest: '/ngprogress'
  },
  ngtable: {
    src: node_modules + 'ng-table/dist/ng-table.min.css',
    srcmap: node_modules + 'ng-table/dist/ng-table.min.css.map',
    dest: '/ng-table'
  },
  animatecss: {
    src: node_modules + 'animate.css/animate.min.css',
    dest: '/animate.css'
  }
};

// jquery
task('jquery', function() {
  return src(js_paths.jquery.src)
    .pipe(dest(vendorPath + js_paths.jquery.dest))
    .pipe(dest(vendorPathDev + js_paths.jquery.dest));
});

// angular
task('angular', function() {
  return src([js_paths.angular.src, js_paths.angular.srcmap])
    .pipe(dest(vendorPath + js_paths.angular.dest))
    .pipe(dest(vendorPathDev + js_paths.angular.dest));
});

// animations via animate.css
task('animatecss', function() {
  return src(css_paths.animatecss.src)
    .pipe(dest(vendorPath + css_paths.animatecss.dest))
    .pipe(dest(vendorPathDev + css_paths.animatecss.dest));
});

// bootstrap deps
task('bootstrap_js', function() {
  return src(js_paths.bootstrap.src)
    .pipe(dest(vendorPath + js_paths.bootstrap.dest))
    .pipe(dest(vendorPathDev + js_paths.bootstrap.dest));
});
task('bootstrap_css', function() {
  return src([css_paths.bootstrap.src, css_paths.bootstrap.srcmap])
    .pipe(dest(vendorPath + css_paths.bootstrap.dest))
    .pipe(dest(vendorPathDev + css_paths.bootstrap.dest));
});
task('bootstrap_fonts', function() {
  return src(css_paths.bootstrap.fonts)
    .pipe(dest(vendorPath + '/fonts/'))
    .pipe(dest(vendorPathDev + '/fonts/'));
});
//			js_paths.angular_bootstrap.src,
task('angular_bootstrap', function() {
  return src(js_paths.angular_bootstrap.src)
    .pipe(dest(vendorPath + js_paths.angular_bootstrap.dest))
    .pipe(dest(vendorPathDev + js_paths.angular_bootstrap.dest));
});
// angular_bootstrapcss
task('angular_bootstrap_css', function() {
  return src([css_paths.angular_bootstrap.src])
    .pipe(dest(vendorPath + css_paths.angular_bootstrap.dest))
    .pipe(dest(vendorPathDev + css_paths.angular_bootstrap.dest));
});
// angular_bootstrapcss
task('colresizable', function() {
  return src([js_paths.colresizable.src])
    .pipe(dest(vendorPath + js_paths.colresizable.dest))
    .pipe(dest(vendorPathDev + js_paths.colresizable.dest));
});

task(
  'bootstrap',
  series(
    'bootstrap_js',
    'bootstrap_css',
    'bootstrap_fonts',
    'angular_bootstrap',
    'angular_bootstrap_css'
  )
);

// nprogress, raw JS
task('nprogress_js', function() {
  return src(js_paths.nprogress.src)
    .pipe(dest(vendorPath + js_paths.nprogress.dest))
    .pipe(dest(vendorPathDev + js_paths.nprogress.dest));
});
task('nprogress_css', function() {
  return src(css_paths.nprogress.src)
    .pipe(dest(vendorPath + css_paths.nprogress.dest))
    .pipe(dest(vendorPathDev + css_paths.nprogress.dest));
});
// ngprogress = angular implementation
task('ngprogress', function() {
  return src(js_paths.ngprogress.src)
    .pipe(dest(SRC_PATH + 'js/app/vendors/')); //will be bundled into main app JS during optimization
});

task(
  'nprogress',
  series('nprogress_js', 'nprogress_css')
);

task('ngtable', function() {
  return src(css_paths.ngtable.src)
    .pipe(dest(vendorPath + css_paths.ngtable.dest))
    .pipe(dest(vendorPathDev + css_paths.ngtable.dest));
});

// run through all vendor deps. These should've been installed with bower beforehand
task(
  'vendors',
  series(
    'jquery',
    'animatecss',
    'angular',
    'bootstrap',
    'nprogress',
    'ngtable',
    'colresizable'
  )
);

// seems duplicate of js_dependencies_angular?

task('js_dependencies_angular', function() {
  return (
    src([
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
      .pipe(
        ngAnnotate().on('error', function(e) {
          console.log('ngAnnotate failed: ', e);
        })
      )
      .pipe(
        concat('deps.min.js').on('error', function(e) {
          console.log('concat failed: ', e);
        })
      )
      .pipe(dest(DEV_DEST + '/js'))
      /*
    		.pipe(uglify({

    		}).on('error', function(e){
    			console.log(e);
    		}))//*/
      .pipe(dest(BUILD_DEST + '/js'))
      .pipe(browserSync.stream())
  );
});

task('js_scripts', function() {
  return src([SRC_PATH + 'js/*.js', SRC_PATH + 'js/app/**/*.js'])
    .pipe(concat('app.min.js'))
    .pipe(
      ngAnnotate({
        showStack: true
      }).on('error', function(e) {
        console.log('ngAnnotate failed: ', e);
      })
    )
    .pipe(dest(DEV_DEST + '/js'))
    .pipe(
      uglify({
        compress: {
          drop_debugger: true,
          dead_code: false
        }
      }).on('error', function(e) {
        console.log('uglify failed: ', e);
      })
    ) //*/
    .pipe(dest(BUILD_DEST + '/js'))
    .pipe(browserSync.stream());
});

task('html', function() {
  return src([SRC_PATH + '**/*.html'])
    .pipe(dest(DEV_DEST))
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(dest(BUILD_DEST))
    .pipe(browserSync.stream());
});

var compileSASS = function(filename, options) {
  return sass(SRC_PATH + 'scss/**/*.scss', options)
    .pipe(autoprefixer('last 2 versions', '> 5%'))
    .pipe(concat(filename))
    .pipe(dest(BUILD_DEST + '/css'))
    .pipe(dest(DEV_DEST + '/css'))
    .pipe(browserSync.stream());
};

task('sass', function() {
  return compileSASS('custom.css', {});
});

task('sass-minify', function() {
  return compileSASS('custom.min.css', {
    style: 'compressed'
  });
});


// PHP task just copies source to two destinations
task('php', function() {
  return src([SRC_PATH + 'API/**.php', SRC_PATH + 'API/.htaccess'], srcOptions)
    .pipe(dest(BUILD_DEST + 'API'))
    .pipe(dest(DEV_DEST + 'API'))
    .pipe(browserSync.stream());
});

const cleanTargets = [
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
];

// Remove all processed files in dev and build folders.
task('clean', function() {
  return src(cleanTargets, {
    read: false,
    allowEmpty: true
  })
    .pipe(ignore('src/**'))
    .pipe(ignore('node_modules/**'))
    .pipe(ignore('dev_old/**'))
    .pipe(ignore('.git/**'))

    .pipe(
      rimraf({
        force: true
      })
    );

  // 		.pipe(notify({ message: 'Clean task complete', onLast: true }));
});

task('zip', function() {
  return src(BUILD_DEST + '/**/', {
    dot: true,
    allowEmpty: true
  })
    .pipe(zip('build.zip'))
    .pipe(ignore('**/chart.php'))
    .pipe(ignore('**/test.php'))
    .pipe(dest('./'))
    .pipe(
      notify({
        message: 'Build process complete',
        onLast: true
      })
    );
});

task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    startPath: './dev'
  });
});

// ######## main tasks ########
task('watch', function() {
  // Watch .html files
  watch(SRC_PATH + '**/*.html', series('html'));

  // Watch .php API resources
  watch(SRC_PATH + 'API/*.php', series('php'));

  // Watch .js files
  watch(SRC_PATH + 'js/*.js', series('js_scripts'));
  watch(SRC_PATH + 'js/app/**/*.js', series('js_scripts'));

  // too slow to just feed that through, too many files there.
  //watch(node_modules + '**/*.js', ['js_dependencies_angular']);

  // Watch .scss files
  watch(SRC_PATH + 'scss/*.scss', series('sass', 'sass-minify'));
});

// need run sequence, or everything will happen in parallel, meaning the zip process could happen before all files are ready
task(
  'build',
  series(
    'clean',
    'sass',
    'sass-minify',
    'vendors',
    'html',
    'php',
    'js_dependencies_angular',
    'js_scripts',
    'zip'
  )
);

//task('build', ['sass','sass-minify','vendors', 'html', 'php','js_dependencies_angular','js_scripts','zip'])
// Default Task
task('default', series('build', parallel('watch', 'browser-sync')));
