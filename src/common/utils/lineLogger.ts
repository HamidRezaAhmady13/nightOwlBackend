import { Logger } from '@nestjs/common';

export class LineLogger extends Logger {
  log(message: string, context?: string) {
    const stack = new Error().stack?.split('\n')[2]?.trim();
    super.log(`${message} (${stack})`, context);
  }

  error(message: string, trace?: string, context?: string) {
    const stack = new Error().stack?.split('\n')[2]?.trim();
    super.error(`${message} (${stack})`, trace, context);
  }
}
