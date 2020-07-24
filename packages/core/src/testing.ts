/* eslint-disable max-classes-per-file */

import { Arguments, Argv, parse } from '@boost/args';
import { Path } from '@boost/common';
import { mockDebugger } from '@boost/debug/lib/testing';
import Driver from './Driver';
import Script from './Script';
import Tool from './Tool';
import { DriverMetadata } from './types';
import Context from './contexts/Context';
import { DriverContextOptions } from './contexts/DriverContext';
import ScaffoldContext, { ScaffoldContextOptions } from './contexts/ScaffoldContext';
import { ScriptContextOptions } from './contexts/ScriptContext';

export { mockDebugger };

export const BEEMO_TEST_ROOT = Path.resolve('../../../tests', __dirname);

export class TestDriver<O extends object = {}> extends Driver<O> {
  name = 'test-driver';
}

export class TestScript<O extends object = {}> extends Script<O> {
  name = 'test-script';

  execute() {
    return Promise.resolve();
  }
}

export function mockConsole<K extends keyof Console>(name: K): jest.SpyInstance {
  return jest.spyOn(console, name as 'log').mockImplementation(() => {});
}

export function mockTool(argv: Argv = []): Tool {
  const tool = new Tool({
    argv,
    cwd: BEEMO_TEST_ROOT,
  });

  // @ts-expect-error
  tool.debug = mockDebugger();

  tool.config = {
    configure: {
      cleanup: false,
      parallel: true,
    },
    debug: false,
    drivers: [],
    execute: {
      concurrency: 1,
      graph: true,
    },
    module: '@beemo/local',
    scripts: [],
    settings: {},
  };

  tool.package = {
    name: 'beemo-test',
    version: '0.0.0',
  };

  return tool;
}

export function mockDriver<C extends object = {}>(
  name: string,
  tool: Tool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver<C> {
  const driver = new TestDriver<C>();

  driver.name = name;
  driver.tool = tool || mockTool();

  driver.setMetadata({
    bin: name.toLowerCase(),
    configName: `${name}.json`,
    title: name,
    ...metadata,
  });

  return driver;
}

export function mockScript(name: string, tool: Tool | null = null): Script<{}> {
  const script = new TestScript<{}>();

  script.name = name;
  script.tool = tool || mockTool();

  return script;
}

export function stubArgs<T extends object>(options: T): Arguments<T> {
  return {
    command: [],
    errors: [],
    options,
    params: [],
    rest: [],
    unknown: {},
  };
}

export function stubDriverArgs(
  fields?: Partial<DriverContextOptions>,
): Arguments<DriverContextOptions> {
  return stubArgs({
    concurrency: 1,
    graph: false,
    stdio: 'buffer',
    workspaces: '',
    ...fields,
  });
}

export function stubScaffoldArgs(
  fields?: Partial<ScaffoldContextOptions>,
): Arguments<ScaffoldContextOptions> {
  return stubArgs({
    dry: false,
    ...fields,
  });
}

export function stubScriptArgs(
  fields?: Partial<ScriptContextOptions>,
): Arguments<ScriptContextOptions> {
  return stubArgs({
    concurrency: 1,
    graph: false,
    stdio: 'buffer',
    workspaces: '',
    ...fields,
  });
}

export function applyContext<T extends Context>(context: T): T {
  context.args = parse(['-a', '--foo', 'bar', 'baz'], { options: {} });
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.cwd = BEEMO_TEST_ROOT;
  context.configModuleRoot = BEEMO_TEST_ROOT;
  context.workspaceRoot = BEEMO_TEST_ROOT;
  context.workspaces = [];

  return context;
}

export function stubScaffoldContext(
  generator: string = 'generator',
  action: string = 'action',
  name: string = '',
): ScaffoldContext {
  return applyContext(new ScaffoldContext(stubScaffoldArgs(), generator, action, name));
}
