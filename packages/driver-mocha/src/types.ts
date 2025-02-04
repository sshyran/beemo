export type UISetting = 'bdd' | 'tdd' | 'qunit' | 'exports';

export interface ReporterOptions {
  [key: string]: unknown;
}

export interface MochaConfig {
  // Dashed and alias names
  [key: string]: unknown;
  allowUncaught?: boolean;
  asyncOnly?: boolean;
  bail?: boolean;
  checkLeaks?: boolean;
  color?: boolean;
  delay?: boolean;
  diff?: boolean;
  exit?: boolean;
  extension?: string | string[];
  fgrep?: string;
  file?: string | string[];
  forbidOnly?: boolean;
  forbidPending?: boolean;
  fullTrace?: boolean;
  global?: string | string[];
  grep?: string;
  growl?: boolean;
  ignore?: string | string[];
  inlineDiffs?: boolean;
  invert?: boolean;
  noExit?: boolean;
  noTimeout?: boolean;
  opts?: string;
  package?: string;
  recursive?: boolean;
  reporter?: string;
  reporterOption?: string | string[];
  require?: string | string[];
  retries?: number;
  slow?: number;
  sort?: boolean;
  spec?: string;
  timeout?: number;
  traceWarnings?: boolean;
  ui?: UISetting;
  v8StackTraceLimit?: number;
  watch?: boolean;
  watchFiles?: string | string[];
  watchIgnore?: string | string[];
}

export interface MochaArgs {
  A?: boolean;
  allowUncaught?: boolean;
  asyncOnly?: boolean;
  b?: boolean;
  bail?: boolean;
  c?: boolean;
  checkLeaks?: boolean;
  color?: boolean;
  colors?: boolean;
  config?: string;
  delay?: boolean;
  diff?: boolean;
  exclude?: string[];
  exit?: boolean;
  extension?: string[];
  f?: string;
  fgrep?: string;
  file?: string[];
  forbidOnly?: boolean;
  forbidPending?: boolean;
  fullTrace?: boolean;
  g?: string;
  G?: boolean;
  global?: string[];
  globals?: string[];
  grep?: string;
  growl?: boolean;
  h?: boolean;
  help?: boolean;
  i?: boolean;
  ignore?: string[];
  inlineDiffs?: boolean;
  interfaces?: boolean;
  invert?: boolean;
  O?: string[];
  opts?: string;
  package?: string;
  r?: string[];
  R?: string;
  recursive?: boolean;
  reporter?: string;
  reporterOption?: string[];
  reporterOptions?: string[];
  reporters?: boolean;
  require?: string[];
  retries?: number;
  s?: string;
  S?: boolean;
  slow?: string;
  sort?: boolean;
  t?: string;
  timeout?: string;
  timeouts?: string;
  u?: UISetting;
  ui?: UISetting;
  V?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
  watchExtensions?: string[];
}

export type MochaDriverArgs = MochaArgs;
