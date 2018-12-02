const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const webp = require('gulp-webp');
const responsive = require('gulp-responsive');
const $ = require('gulp-load-plugins')();
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const workboxBuild = require('workbox-build');



gulp.task('clean-build', () => {
  return del.sync('build');
});

gulp.task('clean-images', () => {
  return del.sync([
    'app/img',
    'build/img'
  ]);
});

gulp.task('clean-js', () => {
  return del.sync([
    'build/js'
  ]);
});


gulp.task('images-copy2app', () =>
  gulp.src([
    'src/images/touch/**'
  ])
  .pipe(gulp.dest('app/img/touch'))
);

gulp.task('images-webp', () =>
  gulp.src('src/images/*.jpg')
  .pipe(webp())
  .pipe(gulp.dest('src/images'))
);

gulp.task('images-resize', function () {
  return gulp.src('src/images/*.{jpg,webp}')
    .pipe($.responsive({
      '*.{jpg,webp}': [{
        width: 300,
        rename: { suffix: '_w_300' },
      }, {
        width: 433,
        rename: { suffix: '_w_433' },
      }, {
        width: 552,
        rename: { suffix: '_w_552' },
      }, {
        width: 653,
        rename: { suffix: '_w_653' },
      }, {
        width: 752,
        rename: { suffix: '_w_752' },
      }, {
        width: 800,
        rename: { suffix: '_w_800' },
      }],
    }, {

      quality: 70,
      progressive: true,
      compressionLevel: 6,
      withMetadata: false,
    }))
    .pipe(gulp.dest('app/img'));
});

gulp.task('images-copy2build', () =>
  gulp.src('app/img/**/*', {base: 'app/img/'})
  .pipe(gulp.dest('build/img'))
);

gulp.task('html-copy2build', () =>
  gulp.src('app/*.html')
  .pipe(gulp.dest('build'))
);


gulp.task('css-minify', () => {
  return gulp.src('app/css/**/*.css')
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))
  .pipe(gulp.dest('build/css'));
});

gulp.task('css-copy2build', () =>
  gulp.src('app/css/**/*.css')
  .pipe(gulp.dest('build/css'))
);

gulp.task('js-copy2build', () =>
  gulp.src('app/js/**/*.js')
  .pipe(gulp.dest('build/js'))
);

gulp.task('js-babel', () => {

  return gulp.src([
    'app/js/dbhelper.js', 'app/js/app.js', 'app/js/restaurant_info.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-idb', () => {
  return gulp.src([
    'app/js/idb-promised.js', 'app/js/idb.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('idb-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-main', () => {
  return gulp.src([
    'app/js/dbhelper.js', 'app/js/app.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-resto', () => {
  return gulp.src([
    'app/js/dbhelper.js', 'app/js/restaurant_info.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('resto-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('pwa-service-worker', () => {
  return workboxBuild.injectManifest({
    swSrc: 'src/js/sw.js',
    swDest: 'build/sw.js',
    globDirectory: 'build',
    globPatterns: [
      '**\/*.{html,css,js}',
      'img/touch/*.png',
      'manifest.json'
    ],
    globIgnores: [
      'workbox-config.js',
      'node_modules/**/*'
    ]
  }).then(({count, size, warnings}) => {
    warnings.forEach(console.warn);
    console.log(
      `[INFO] ${count} files will be precached, totaling ${size} bytes.`);
  }).catch(err => {
    console.log('[ERROR] ' + err);
  });
});

gulp.task('pwa-manifest-copy2build', () =>
  gulp.src('app/manifest.json')
  .pipe(gulp.dest('build'))
);

gulp.task('default', ['build']);

gulp.task('watch', () => {
  gulp.watch('app/img/**', ['images-copy2build']);
  gulp.watch('app/*.html', ['html-copy2build']);
  gulp.watch('app/css/**/*.css', ['css-copy2build']);
  gulp.watch('app/js/**/*.js', ['build-js']);
  gulp.watch('app/manifest.json', ['pwa-manifest-copy2build']);
  gulp.watch('src/js/sw.js', ['pwa-service-worker']);
});

gulp.task('build-images', cb => {
  runSequence(
    'clean-images', 'images-copy2app', 'images-webp', 'images-resize',
    'images-copy2build',
    cb);
});

gulp.task('build-js', cb => {
  runSequence(
    'clean-js',
    'js-minify-idb',
    ['js-minify-main', 'js-minify-resto'],
    'pwa-service-worker',
    cb);
});

gulp.task('build', cb => {
  runSequence(
    'clean-build',
    'build-images',
    'html-copy2build',
    'css-minify',
    ['js-minify-idb', 'js-minify-main', 'js-minify-resto'],
    'pwa-manifest-copy2build', 'pwa-service-worker',
    cb);
});
