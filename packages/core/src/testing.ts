/* eslint-disable max-classes-per-file */

import { Arguments } from '@boost/args';
import Driver from './Driver';
import Script from './Script';
import Tool from './Tool';
import { DriverMetadata } from './types';
import { DriverContextOptions } from './contexts/DriverContext';
import { ScaffoldContextOptions } from './contexts/ScaffoldContext';
import { ScriptContextOptions } from './contexts/ScriptContext';

export class TestDriver<O extends object = {}> extends Driver<O> {
  name = 'test-driver';
}

export class TestScript<O extends object = {}> extends Script<O> {
  name = 'test-script';

  execute() {
    return Promise.resolve();
  }
}

export function mockDriver<C extends object = {}>(
  name: string,
  tool: Tool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver<C> {
  const driver = new TestDriver<C>();

  driver.name = name;
  // driver.tool = tool || mockTool();

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
  // script.tool = tool || mockTool();

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
