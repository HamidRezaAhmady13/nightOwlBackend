"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineLogger = void 0;
const common_1 = require("@nestjs/common");
class LineLogger extends common_1.Logger {
    log(message, context) {
        const stack = new Error().stack?.split('\n')[2]?.trim();
        super.log(`${message} (${stack})`, context);
    }
    error(message, trace, context) {
        const stack = new Error().stack?.split('\n')[2]?.trim();
        super.error(`${message} (${stack})`, trace, context);
    }
}
exports.LineLogger = LineLogger;
//# sourceMappingURL=lineLogger.js.map