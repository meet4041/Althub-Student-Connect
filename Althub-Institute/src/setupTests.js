import '@testing-library/jest-dom';

// Polyfill MutationObserver for older JSDOM environments
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};