// src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LineLogger } from '../utils/lineLogger';

// @Injectable()
// export class RequestLoggerMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     new LineLogger.log(`[REQ] ${req.method} ${req.originalUrl}`);
//     // new LineLogger.log(`[REQ]`, ` ${req.method} ${req.originalUrl}`);
//     next();
//   }
// }

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const logger = new LineLogger('RequestLogger'); // give it a context name
    // logger.log(`[REQ]`, ` ${req.method} ${req.originalUrl}`);
    next();
  }
}
