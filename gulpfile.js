const gulp = require('gulp');
gulp.task('sw', function(callback) {
  const swPrecache = require('sw-precache');
  const appDir = 'app';
  swPrecache.write(
    `${appDir}/sw.js`,
    {
      staticFileGlobs: [
        appDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}',
      ],
      stripPrefix: appDir,
    },
    callback,
  );
});

gulp.task('default', ['sw']);
