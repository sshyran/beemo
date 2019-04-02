import path from 'path';
import execa from 'execa';
import parseArgs from 'yargs-parser';
import { mockDebugger, mockTool as baseMockTool, stubArgs } from '@boost/core/test-utils';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext, { ConfigArgs } from './contexts/ConfigContext';
import DriverContext, { DriverArgs } from './contexts/DriverContext';
import ScaffoldContext, { ScaffoldArgs } from './contexts/ScaffoldContext';
import ScriptContext, { ScriptArgs } from './contexts/ScriptContext';
import { BeemoTool, BeemoConfig, BeemoPluginRegistry, DriverMetadata } from './types';

// Use core package since resources are located here
export const BEEMO_APP_PATH = path.join(__dirname, '..');

// Use a folder that should not cause issues / contain much code
export const BEEMO_TEST_ROOT = path.join(__dirname, '../../../tests');

export { mockDebugger, stubArgs };

export function mockTool(): BeemoTool {
  const tool = baseMockTool<BeemoPluginRegistry, BeemoConfig>(
    {
      appName: 'beemo',
      appPath: BEEMO_APP_PATH,
      configBlueprint: {},
      configName: 'beemo',
      root: BEEMO_TEST_ROOT,
      scoped: true,
      workspaceRoot: BEEMO_TEST_ROOT,
    },
    {
      configure: {
        cleanup: false,
        parallel: true,
      },
      drivers: [],
      execute: {
        concurrency: 0,
        priority: true,
      },
      scripts: [],
    },
    false,
  );

  // Stub out emitter
  const baseOn = tool.on.bind(tool);

  tool.on = jest.fn((...args) => baseOn(...args));

  return tool;
}

export function mockDriver<C extends object = {}>(
  name: string,
  tool: BeemoTool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver<C> {
  const driver = new Driver<C>();

  driver.name = name;
  driver.tool = tool || mockTool();

  driver.setMetadata({
    bin: name,
    configName: `${name}.json`,
    title: name,
    ...metadata,
  });

  driver.bootstrap();

  return driver;
}

export function applyContext<T extends Context>(context: T): T {
  context.args = parseArgs(['-a', '--foo', 'bar', 'baz']);
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.cwd = BEEMO_TEST_ROOT;
  context.moduleRoot = BEEMO_TEST_ROOT;
  context.workspaceRoot = BEEMO_TEST_ROOT;
  context.workspaces = [];

  return context;
}

export function stubContext(): Context {
  return applyContext(new Context(stubArgs()));
}

export function stubConfigArgs(fields?: Partial<ConfigArgs>) {
  return stubArgs<ConfigArgs>({
    names: [],
    ...fields,
  });
}

export function stubConfigContext(): ConfigContext {
  return applyContext(new ConfigContext(stubConfigArgs()));
}

export function stubDriverArgs(fields?: Partial<DriverArgs>) {
  return stubArgs<DriverArgs>({
    concurrency: 1,
    live: false,
    priority: false,
    workspaces: '',
    ...fields,
  });
}

export function stubDriverContext(driver?: Driver): DriverContext {
  return applyContext(new DriverContext(stubDriverArgs(), driver || new Driver()));
}

export function stubScaffoldArgs(fields?: Partial<ScaffoldArgs>) {
  return stubArgs<ScaffoldArgs>({
    action: '',
    dry: false,
    generator: '',
    name: '',
    ...fields,
  });
}

export function stubScaffoldContext(
  generator: string = 'generator',
  action: string = 'action',
  name: string = '',
): ScaffoldContext {
  return applyContext(new ScaffoldContext(stubScaffoldArgs(), generator, action, name));
}

export function stubScriptArgs(fields?: Partial<ScriptArgs>) {
  return stubArgs<ScriptArgs>({
    concurrency: 1,
    name: 'foo',
    priority: false,
    workspaces: '',
    ...fields,
  });
}

export function stubScriptContext(script?: Script): ScriptContext {
  const context = applyContext(new ScriptContext(stubScriptArgs(), 'script'));

  if (script) {
    context.setScript(script, './script.js');
  }

  return context;
}

export function stubExecResult(fields?: Partial<execa.ExecaReturns>): execa.ExecaReturns {
  return {
    cmd: '',
    code: 0,
    failed: false,
    killed: false,
    signal: null,
    stderr: '',
    stdout: '',
    timedOut: false,
    ...fields,
  };
}

export function prependRoot(part: string): string {
  return path.join(BEEMO_TEST_ROOT, part);
}

export function getRoot(): string {
  return BEEMO_TEST_ROOT;
}