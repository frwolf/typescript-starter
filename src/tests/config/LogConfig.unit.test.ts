import { describe, it, expect } from 'vitest';

import { getLogger } from '../../config/LogConfig';

describe('LogConfig', () => {
  it('should return a Logger instance with expected methods', () => {
    const logger = getLogger('testLogger');

    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.fatal).toBe('function');
  });
});
