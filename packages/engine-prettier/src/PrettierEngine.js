/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from '@droid/core';

export default class PrettierEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: '.prettierrc',
      description: 'Format code with Prettier.',
      title: 'Prettier',
    });
  }
}
