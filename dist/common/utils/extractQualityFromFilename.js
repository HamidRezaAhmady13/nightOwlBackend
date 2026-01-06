"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractQualityFromFilename = extractQualityFromFilename;
function extractQualityFromFilename(filename) {
    const match = filename.match(/(\d{3,4})p/);
    return match ? `${match[1]}p` : 'auto';
}
//# sourceMappingURL=extractQualityFromFilename.js.map