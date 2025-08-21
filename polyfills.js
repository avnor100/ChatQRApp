// polyfills.js
// Define globalThis.File for environments where it's missing (Metro/Node context)
if (typeof globalThis.File === 'undefined') {
  class RNFile extends Blob {
    constructor(chunks, filename, options = {}) {
      super(chunks, options);
      this.name = filename;
      this.lastModified = options.lastModified ?? Date.now();
    }
  }
  // Minimal compatibility shape
  Object.defineProperty(RNFile.prototype, 'toString', {
    value() { return '[object File]'; },
  });
  globalThis.File = RNFile;
}
