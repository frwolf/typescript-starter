import process from 'node:process';

import type { Config } from './models/config-model.js';
import { validateConfig } from './utils/utils.js';
import { getLogger } from './config/LogConfig.js';

const log = getLogger('process');

// Handle SIGINT & SIGTERM signals
const cleanup = () => {
  log.info('Performing cleanup...');
  // Add cleanup logic here
  process.exit(0);
};

// Handle signals
process.on('SIGINT', () => {
  log.info('Received SIGINT (Ctrl+C)');
  cleanup();
});

process.on('SIGTERM', () => {
  log.info('Received SIGTERM');
  cleanup();
});

const serverConfig: Config = {
  id: `srv-1`,
  description: `Config for Server-1`,
  count: 3
};

(async function () {
  log.info(`Begin processing.`);

  // As an example (see Dockerfile) when the app is running in containerized environment, the CONTAINERIZED env variable is set to true
  log.info(`ENV CONTAINERIZED: ${process.env.CONTAINERIZED}`);

  const validationResult = await validateConfig(serverConfig);
  if (validationResult) {
    log.info(`Server config is valid!`);
  } else {
    log.info(`Server config is not valid!`);
  }

  // Artificial delay so you have time to test signals.
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });

  log.info(`Processing ready.`);
})();
