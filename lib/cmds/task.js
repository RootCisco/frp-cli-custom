'use strict';

// const Rx = require('rxjs/Rx');
// const path = require('path');
const chalk = require('chalk');
const timer = require('../util/timer');
const t = require('../tasks');
const util = require('../util/util');
const coreUtil = require('util');

exports.command = 'task <name>';
exports.desc = 'Execute single build task';
exports.builder = {
  production: {
    alias: 'p',
    default: false,
    describe: 'production mode',
    type: 'boolean',
    global: true
  },
};
exports.aliases = [];
exports.handler = function (argv) {
  try {
    const config = util.getConfig(argv);
    let name = argv.name;
    if (!t[name]) {
      throw new Error(`Not found task name.(${name})`);
    }
    t[name](config[name]).subscribe(() => {
      timer.output();
      console.log(chalk.green('Succeeded'));
      process.exit(0);
    }, (e) => {
      if (e) {
        if (e.formatted) {
          console.log('\n', chalk.red(e.formatted));
        } else {
          console.error('\n', chalk.red(coreUtil.inspect(e)));
        }
      }
      process.exit(1);
    });
  } catch (e) {
    console.error('\n',chalk.red(coreUtil.inspect(e)));
    process.exit(1);
  }
};
