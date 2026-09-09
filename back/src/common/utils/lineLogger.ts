// src/common/utils/line-logger.ts
import { Logger, LoggerService } from '@nestjs/common';

export class LineLogger implements LoggerService {
  constructor(private readonly defaultContext = 'App') {}

  private caller(): string | null {
    const s = new Error().stack;
    const line = s
      ?.split('\n')
      .find((ln, i) => i > 2 && !/node_modules|internal|LineLogger/.test(ln));
    const m =
      line?.match(/\((.*):(\d+):(\d+)\)$/) ||
      line?.match(/at (.*):(\d+):(\d+)$/);
    if (!m) return null;
    const [, file, l, c] = m;
    return file.split('/').slice(-2).join('/') + `:${l}:${c}`;
  }

  private findLocation() {
    const loc = this.caller();
    const time = new Date().toLocaleString().split(',')[1];
    return `${loc} - ${time}`;
  }

  log(message: unknown) {
    new Logger(this.findLocation()).log(message);
  }

  error(message: unknown, trace?: string) {
    new Logger(this.findLocation()).error(`${message} -${trace}`);
  }

  warn(message: unknown) {
    new Logger(this.findLocation()).warn(`${message}  `);
  }

  debug(message: unknown) {
    new Logger(this.findLocation()).debug(`${message}  `);
  }

  verbose(message: unknown) {
    new Logger(this.findLocation()).verbose(`${message}  `);
  }
}
