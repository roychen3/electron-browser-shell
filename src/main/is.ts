export function isMac() {
  return process.platform === 'darwin';
}

export function isFilenameWithExtension(filename: string) {
  return /^[^.]+\.[a-zA-Z0-9]+$/.test(filename);
}
