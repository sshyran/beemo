import rimraf from 'rimraf';
import { Driver, DriverArgs, DriverContext, Path, ExecutionError } from '@beemo/core';
import { BabelDriverArgs, BabelConfig } from './types';

// Success: Writes file list to stdout
// Failure: Throws SyntaxError to stderr
export default class BabelDriver extends Driver<BabelConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: 'babel.config.js',
      configOption: '--config-file',
      description: this.tool.msg('app:babelDescription'),
      title: 'Babel',
      watchOptions: ['-w', '--watch'],
    });

    this.setCommandOptions({
      clean: {
        boolean: true,
        default: false,
        description: this.tool.msg('app:babelCleanOption'),
      },
    });

    this.onBeforeExecute.listen(this.handleCleanTarget);
  }

  extractErrorMessage(error: ExecutionError): string {
    if (error.message.includes('SyntaxError')) {
      return error.message.split(/|\s+at/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }

  /**
   * Automatically clean the target folder if --out-dir is used.
   */
  private handleCleanTarget = ({ args }: DriverContext<DriverArgs & BabelDriverArgs>) => {
    if (args.clean && args.outDir) {
      rimraf.sync(Path.resolve(args.outDir).path());
    }

    return Promise.resolve();
  };
}
