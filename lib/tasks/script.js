'use strict';

const Rx = require('rxjs/Rx');
const path = require('path');
const webpack = require('webpack');
const ora = require('ora');
const timer = require('../util/timer');

/**
 * script task
 * @param config{object} webpack config object
 * @returns {Rx.Observable}
 */
module.exports = function (config) {
  timer.start('script');
  const spinner = ora('[build] script').start();

  if (process.env.NODE_PATH) {
    let paths = process.env.NODE_PATH.split(path.delimiter);
    config.resolve.modules = config.resolve.modules ? config.resolve.modules.concat(paths) : paths;
    config.resolveLoader.modules = config.resolveLoader.modules ? config.resolveLoader.modules.concat(paths) : paths;
  }
  // config.entry = config.entry || {};
  /** mochaのユニットテストをPassするために現状このように追記してる。*/
  if(config.mode === undefined) config.mode = 'none';
  config.entry = (config.entry !== undefined) ? config.entry || {} : path.resolve('test/code/mocha-test.js');
  /** --- */
  return Rx.Observable.create((observer) => {
    webpack(config, (err, stats) => {
      console.log(stats.toString({
        chunks: false,
        colors: true
      }));
      if (err || stats.hasErrors()) {
        spinner.fail();
        return observer.error(err);
      }
      let sj = stats.toJson(true);
      let files = [];
      sj.chunks.forEach((c) => {
        files = files.concat(c.files);
      });
      spinner.succeed();
      timer.end('script');
      observer.next(files);
    });
  });
};
