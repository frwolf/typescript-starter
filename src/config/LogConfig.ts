/*--- LogConfig.ts ---*/
import { LogLevel } from 'typescript-logging';
import { Log4TSProvider } from 'typescript-logging-log4ts-style';
import type { Logger } from 'typescript-logging-log4ts-style';

const provider = Log4TSProvider.createProvider('ExampleProvider', {
  /* Specify the various group expressions to match against */
  groups: [
    {
      expression: new RegExp('model.+'),
      level: LogLevel.Debug /* This group will log on debug instead */
    },
    {
      expression: new RegExp('service.+')
    }
  ]
});

/**
 * Retrieve a logger instance by name.
 * @param name - The name of the logger.
 * @returns A Logger instance associated with the given name.
 */
export const getLogger = (name: string): Logger => {
  return provider.getLogger(name);
};
