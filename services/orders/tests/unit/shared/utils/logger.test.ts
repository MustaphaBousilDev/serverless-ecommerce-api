import { Logger, LogLevel, createLogger } from '../../../../src/shared/utils/logger';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Logger Creation', () => {
    test('should create logger with context', () => {
      const logger = new Logger('TestContext');

      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.context).toBe('TestContext');
    });

    test('should create logger using factory function', () => {
      const logger = createLogger('FactoryContext');

      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Log Levels', () => {
    test('should log debug messages', () => {
      const logger = new Logger('Test');
      logger.debug('Debug message', { extra: 'data' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logOutput.level).toBe(LogLevel.DEBUG);
      expect(logOutput.message).toBe('Debug message');
      expect(logOutput.data).toEqual({ extra: 'data' });
    });

    test('should log info messages', () => {
      const logger = new Logger('Test');
      logger.info('Info message');

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.INFO);
    });

    test('should log warn messages', () => {
      const logger = new Logger('Test');
      logger.warn('Warning message');

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.WARN);
    });

    test('should log error messages', () => {
      const logger = new Logger('Test');
      logger.error('Error message');

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe(LogLevel.ERROR);
    });
  });

  describe('Log Structure', () => {
    test('should include timestamp in log', () => {
      const logger = new Logger('Test');
      logger.info('Test');

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput).toHaveProperty('timestamp');
      expect(new Date(logOutput.timestamp)).toBeInstanceOf(Date);
    });

    test('should include all required fields', () => {
      const logger = new Logger('TestContext');
      logger.info('Test message', { data: 'value' });

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logOutput).toHaveProperty('timestamp');
      expect(logOutput).toHaveProperty('level');
      expect(logOutput).toHaveProperty('context');
      expect(logOutput).toHaveProperty('message');
      expect(logOutput).toHaveProperty('data');
    });
  });

  describe('Error Logging', () => {
    test('should format Error objects correctly', () => {
      const logger = new Logger('Test');
      const error = new Error('Test error');

      logger.error('Error occurred', error);

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logOutput.data).toHaveProperty('name', 'Error');
      expect(logOutput.data).toHaveProperty('message', 'Test error');
      expect(logOutput.data).toHaveProperty('stack');
    });

    test('should handle non-Error objects', () => {
      const logger = new Logger('Test');
      const errorObj = { code: 'ERR_001', detail: 'Something' };

      logger.error('Error occurred', errorObj);

      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.data).toEqual(errorObj);
    });
  });
});