// Polyfill DOMException before any module loads — Hermes lacks it, axios 1.x requires it
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
    }
  };
}

require('expo-router/entry');
