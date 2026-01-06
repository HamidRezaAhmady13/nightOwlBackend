"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUrlPath = toUrlPath;
const path = require("path");
function toUrlPath(absPath) {
    return '/' + path.relative(process.cwd(), absPath).replace(/\\/g, '/');
}
//# sourceMappingURL=toUrlPth.js.map