import fs from 'fs-extra';
import { Path } from '@boost/common';
import { copyFixtureToNodeModule, getFixturePath } from '@boost/test-utils';
import Tool from '../../src/Tool';
import CreateConfigRoutine from '../../src/routines/CreateConfigRoutine';
import Driver from '../../src/Driver';
import {
  STRATEGY_COPY,
  STRATEGY_REFERENCE,
  STRATEGY_CREATE,
  STRATEGY_NONE,
  STRATEGY_NATIVE,
} from '../../src/constants';
import {
  stubConfigContext,
  mockDebugger,
  mockTool,
  prependRoot,
  mockDriver,
  getRoot,
} from '../../src/testing';
import ConfigContext from '../../src/contexts/ConfigContext';

describe('CreateConfigRoutine', () => {
  let writeSpy: jest.SpyInstance;
  let copySpy: jest.SpyInstance;
  let context: ConfigContext;
  let routine: CreateConfigRoutine<ConfigContext>;
  let driver: Driver;
  let tool: Tool;
  let fixtures: Function[];

  beforeEach(() => {
    tool = mockTool();
    context = stubConfigContext();

    driver = mockDriver('babel', tool, {
      configName: 'babel.config.js',
      configOption: '--config-file',
      title: 'Babel',
    });
    driver.configure({ args: ['--qux'] });

    routine = new CreateConfigRoutine('babel', 'Configure Babel', { driver, tool });
    // @ts-expect-error
    routine.debug = mockDebugger();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    copySpy = jest.spyOn(fs, 'copy').mockImplementation(() => Promise.resolve());

    process.beemo = {
      context,
      tool,
    };

    fixtures = [];
  });

  afterEach(() => {
    delete process.beemo;

    writeSpy.mockRestore();
    copySpy.mockRestore();

    fixtures.forEach((fixture) => fixture());
  });

  describe('constructor()', () => {
    it('errors if no driver defined', () => {
      expect(() => {
        routine = new CreateConfigRoutine('title', 'title');
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('run()', () => {
    beforeEach(() => {
      driver.configure({ strategy: STRATEGY_NATIVE });
    });

    describe('create strategy', () => {
      it('creates config file if `configStrategy` metadata is create', async () => {
        driver.metadata.configStrategy = STRATEGY_CREATE;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const loadSpy = jest.spyOn(routine, 'loadConfigFromSources');
        const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
        const createSpy = jest.spyOn(routine, 'createConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(loadSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(mergeSpy).toHaveBeenCalledWith(context, [{ babel: true }], expect.anything());
        expect(createSpy).toHaveBeenCalledWith(context, { babel: true }, expect.anything());
        expect(path).toEqual(prependRoot('/babel.config.js'));
        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          `module.exports = ${JSON.stringify({ babel: true }, null, 2)};`,
        );
      });

      it('creates config file if `strategy` option is create', async () => {
        driver.configure({ strategy: STRATEGY_CREATE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const loadSpy = jest.spyOn(routine, 'loadConfigFromSources');
        const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
        const createSpy = jest.spyOn(routine, 'createConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(loadSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(mergeSpy).toHaveBeenCalledWith(context, [{ babel: true }], expect.anything());
        expect(createSpy).toHaveBeenCalledWith(context, { babel: true }, expect.anything());
        expect(path).toEqual(prependRoot('/babel.config.js'));
        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          `module.exports = ${JSON.stringify({ babel: true }, null, 2)};`,
        );
      });
    });

    describe('copy strategy', () => {
      it('copies config file if `configStrategy` metadata is copy', async () => {
        driver.metadata.configStrategy = STRATEGY_COPY;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });

      it('copies config file if `strategy` option is copy', async () => {
        driver.configure({ strategy: STRATEGY_COPY });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('reference strategy', () => {
      it('references config file if `configStrategy` metadata is reference', async () => {
        driver.metadata.configStrategy = STRATEGY_REFERENCE;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const refSpy = jest.spyOn(routine, 'referenceConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(refSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });

      it('references config file if `strategy` option is reference', async () => {
        driver.configure({ strategy: STRATEGY_REFERENCE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const refSpy = jest.spyOn(routine, 'referenceConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(refSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('native strategy', () => {
      it('falls back to `configStrategy` metadata when `strategy` option is native', async () => {
        driver.configure({ strategy: STRATEGY_NATIVE });
        driver.metadata.configStrategy = STRATEGY_COPY;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('none strategy', () => {
      it('does nothing since routine is skipped', async () => {
        driver.configure({ strategy: STRATEGY_NONE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');

        await routine.run(context, []);

        expect(envSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('copyConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.copyConfigFile(context);

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('copies file', async () => {
      const path = await routine.copyConfigFile(context);

      expect(copySpy).toHaveBeenCalledWith(
        prependRoot('/configs/babel.js').path(),
        prependRoot('/babel.config.js').path(),
        { overwrite: true },
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.copyConfigFile(context);

      expect(driver.config).toEqual({ babel: true });
    });

    it('emits `onCopyConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onCopyConfigFile.listen(spy);

      await routine.copyConfigFile(context);

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        babel: true,
      });
    });

    it('errors if no source file', async () => {
      routine.getConfigPath = () => null;

      await expect(routine.copyConfigFile(context)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('createConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.createConfigFile(context, { foo: 'bar' });

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('writes and formats file', async () => {
      const path = await routine.createConfigFile(context, { foo: 'bar' });

      expect(writeSpy).toHaveBeenCalledWith(
        prependRoot('/babel.config.js').path(),
        'module.exports = {\n  "foo": "bar"\n};',
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.createConfigFile(context, { foo: 'bar' });

      expect(driver.config).toEqual({ foo: 'bar' });
    });

    it('emits `onCreateConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onCreateConfigFile.listen(spy);

      await routine.createConfigFile(context, { foo: 'bar' });

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        foo: 'bar',
      });
    });
  });

  describe('getConfigPath()', () => {
    it('returns from configuration module `configs/file.js`', () => {
      tool.config.module = 'from-config-module';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

      const path = routine.getConfigPath(context);

      expect(path).toEqual(
        new Path(process.cwd(), 'node_modules', 'from-config-module/configs/babel.js'),
      );
    });

    it('returns from configuration module `lib/configs/file.js`', () => {
      tool.config.module = 'from-config-lib-module';

      fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

      const path = routine.getConfigPath(context);

      expect(path).toEqual(
        new Path(process.cwd(), 'node_modules', 'from-config-lib-module/lib/configs/babel.js'),
      );
    });

    it('returns from @local `configs/file.js`', () => {
      tool.config.module = '@local';
      context.workspaceRoot = new Path(getFixturePath('config-module'));

      const path = routine.getConfigPath(context);

      expect(path).toEqual(new Path(getFixturePath('config-module', 'configs/babel.js')));
    });

    it('returns from @local `lib/configs/file.js`', () => {
      tool.config.module = '@local';
      context.workspaceRoot = new Path(getFixturePath('config-lib-module'));

      fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

      const path = routine.getConfigPath(context);

      expect(path).toEqual(new Path(getFixturePath('config-lib-module', 'lib/configs/babel.js')));
    });
  });

  describe('mergeConfigs()', () => {
    it('merges multiple sources', async () => {
      const config = await routine.mergeConfigs(context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(config).toEqual({
        foo: 456,
        bar: 'abc',
        qux: true,
      });
    });

    it('calls `mergeConfig` on driver', async () => {
      const spy = jest.spyOn(driver, 'mergeConfig');

      await routine.mergeConfigs(context, [{ foo: 123, qux: true }, { bar: 'abc' }, { foo: 456 }]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('emits `onMergeConfig` event with final config object', async () => {
      const spy = jest.fn();

      driver.onMergeConfig.listen(spy);

      const config = await routine.mergeConfigs(context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(spy).toHaveBeenCalledWith(context, config);
    });
  });

  describe('loadConfigFromSources()', () => {
    it('loads config if it exists', async () => {
      tool.config.module = 'from-config-module';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

      const configs = await routine.loadConfigFromSources(context, []);

      expect(configs).toEqual([{ babel: true, lib: false }, { babel: true }]);
    });

    it('does nothing if config does not exist', async () => {
      tool.config.module = 'unknown-module';

      const configs = await routine.loadConfigFromSources(context, []);

      expect(configs).toEqual([]);
    });

    it('uses local path when using @local config', async () => {
      const configs = await routine.loadConfigFromSources(context, []);

      expect(configs).toEqual([{ babel: true }]);
    });

    it('emits `onLoadModuleConfig` event', async () => {
      const spy = jest.fn();

      driver.onLoadModuleConfig.listen(spy);

      await routine.loadConfigFromSources(context, []);

      expect(spy).toHaveBeenCalledWith(context, getRoot().append('/configs/babel.js'), {
        babel: true,
      });
    });

    it('doesnt trigger `onLoadModuleConfig` event if files does not exist', async () => {
      tool.config.module = 'unknown-module';

      const spy = jest.fn();

      driver.onLoadModuleConfig.listen(spy);

      await routine.loadConfigFromSources(context, []);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('referenceConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.referenceConfigFile(context);

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('references file', async () => {
      const path = await routine.referenceConfigFile(context);

      expect(writeSpy).toHaveBeenCalledWith(
        prependRoot('/babel.config.js').path(),
        "module.exports = require('./configs/babel.js');",
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.referenceConfigFile(context);

      expect(driver.config).toEqual({ babel: true });
    });

    it('emits `onReferenceConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onReferenceConfigFile.listen(spy);

      await routine.referenceConfigFile(context);

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        babel: true,
      });
    });

    it('errors if no source file', async () => {
      routine.getConfigPath = () => null;

      await expect(routine.referenceConfigFile(context)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('setEnvVars()', () => {
    it('sets env vars', () => {
      expect(process.env.BEEMO_TEST_VAR).toBeUndefined();

      driver.configure({
        env: {
          NODE_ENV: 'test',
          BEEMO_TEST_VAR: 'true',
        },
      });

      routine.setEnvVars(context, []);

      expect(process.env.BEEMO_TEST_VAR).toBe('true');
    });
  });
});
