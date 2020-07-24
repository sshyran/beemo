import fs from 'fs-extra';
import { Path } from '@boost/common';
import Tool from '../../src/Tool';
import Driver from '../../src/Driver';
import DriverContext from '../../src/contexts/DriverContext';
import CleanupConfigsRoutine from '../../src/routines/CleanupConfigsRoutine';
import { mockTool, mockDebugger, mockDriver, stubDriverContext } from '../../src/testing';

describe('CleanupConfigsRoutine', () => {
  let tool: Tool;
  let driver: Driver;
  let context: DriverContext;
  let routine: CleanupConfigsRoutine;

  beforeEach(() => {
    tool = mockTool();
    driver = mockDriver('test-driver', tool);
    context = stubDriverContext(driver);

    routine = new CleanupConfigsRoutine('cleanup', 'Cleaning up', { tool });
    // @ts-expect-error
    routine.debug = mockDebugger();

    tool.driverRegistry.load(driver);
    tool.driverRegistry.load(mockDriver('other-driver', tool));
  });

  describe('deleteConfigFiles()', () => {
    let removeSpy: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      removeSpy = jest.spyOn(fs, 'remove').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      removeSpy.mockRestore();
    });

    it('does nothing when no config paths', async () => {
      await routine.deleteConfigFiles(context);

      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('calls remove for each config path', async () => {
      context.configPaths = [
        { driver: 'test-driver', path: new Path('./foo.json') },
        { driver: 'other-driver', path: new Path('./.barrc') },
      ];

      await routine.deleteConfigFiles(context);

      expect(removeSpy).toHaveBeenCalledWith('foo.json');
      expect(removeSpy).toHaveBeenCalledWith('.barrc');
    });

    it('emits `onDeleteConfigFile` event', async () => {
      const spy = jest.fn();

      context.primaryDriver.onDeleteConfigFile.listen(spy);

      context.configPaths = [
        { driver: 'test-driver', path: new Path('./foo.json') },
        { driver: 'other-driver', path: new Path('./.barrc') },
      ];

      await routine.deleteConfigFiles(context);

      expect(spy).toHaveBeenCalledWith(context, new Path('foo.json'));
      expect(spy).not.toHaveBeenCalledWith(context, new Path('.barrc'));
    });
  });
});
