/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import * as commandLineArgs from 'command-line-args';
import * as logging from 'plylog';

import {Command} from './command';

let logger = logging.getLogger('cli.lint');
const polylint = require('polylint/lib/cli');


export class LintCommand implements Command {
  name = 'lint';

  description = 'Lints the project';

  args = [
    {
      name: 'input',
      type: String,
      alias: 'i',
      defaultOption: true,
      multiple: true,
      description: 'Files and/or folders to lint. Exclusive. Defaults to cwd.'
    },
    {
      name: 'policy',
      type: String,
      alias: 'p',
      description: 'Your jsconf.json policy file.',
      defaultValue: null
    },
    {
      name: 'config-file',
      type: String,
      defaultValue: 'bower.json',
      description: (
        'If inputs are specified, look for `config-field` in this JSON file.'
      )
    },
    {
      name: 'config-field',
      type: String,
      defaultValue: 'main',
      description: (
        'If config-file is used for inputs, this field determines which ' +
        'file(s) are linted.'
      )
    },
    {
      name: 'follow-dependencies',
      type: Boolean,
      description: (
        'Follow through and lint dependencies. Defaults to true unless ' +
        'an exclusive list of input files is provided.'
      )
    }
  ];

  run(options, config): Promise<any> {
    let lintFiles: string[] = options.input
      || config.inputs.map((i) => i.substring(config.root.length));
    if (lintFiles.length === 0) {
      logger.warn('No inputs specified. Please use the --input, --entrypoint, ' +
        '--shell or --fragment flags');
      let argsCli = commandLineArgs(this.args);
      console.info(argsCli.getUsage({
        title: `polymer ${this.name}`,
        description: this.description,
      }));
      return Promise.resolve();
    }

    // If no flag is provided, default to true (or false if input is given)
    let followDependencies = options['follow-dependencies'] || !options.input;

    return polylint.runWithOptions({
      input: lintFiles,
      root: config.root,
      // TODO: read into config
      bowerdir: 'bower_components',
      policy: options.policy,
      'config-file': options['config-file'],
      'config-field': options['config-field'],
      // NOTE: `no-recursion` has the opposite behavior of `follow-dependencies`
      'no-recursion': !followDependencies,
    }).then(() => null);
  }
}
