import * as path from 'path';

export function toUrlPath(absPath: string): string {
  return '/' + path.relative(process.cwd(), absPath).replace(/\\/g, '/');
}
