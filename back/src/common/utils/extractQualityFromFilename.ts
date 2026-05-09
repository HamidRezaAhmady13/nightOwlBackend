export function extractQualityFromFilename(filename: string): string {
  const match = filename.match(/(\d{3,4})p/);
  return match ? `${match[1]}p` : 'auto';
}
