// server-polyfill.cjs
// Ensure Node (Metro process) has a global File class before any deps load.
if (typeof globalThis.File === 'undefined') {
  class NodeFile extends Blob {
    constructor(chunks = [], name = 'file', options = {}) {
      super(chunks, options);
      this.name = name;
      this.lastModified = options.lastModified ?? Date.now();
    }
    toString() { return '[object File]'; }
  }
  globalThis.File = NodeFile;
}
