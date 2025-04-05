import type { Config } from '../models/config-model.js';

/**
 * Validate the server configuration object.
 * Checks if the config has an 'id' starting with 'srv'.
 * @param config - The server configuration object to validate.
 * @returns A promise that resolves to true if valid, false otherwise.
 */
export const validateConfig = async (config: Config): Promise<boolean> => {
  if ('id' in config) {
    if (config[`id`].startsWith(`srv`)) {
      return true;
    }
  }
  return false;
};
