// Type shim so TypeScript doesn't error on the browser-specific entry point.
// The actual types come from the 'mammoth' package; the browser build has the same API.
declare module 'mammoth/mammoth.browser'
