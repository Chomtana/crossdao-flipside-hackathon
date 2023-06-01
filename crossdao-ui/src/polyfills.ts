import { Buffer } from 'buffer';

declare global {
  interface Window { 
    Buffer: any;
  }
}

window.global = window.global ?? window;
window.Buffer = window.Buffer ?? Buffer;
window.process = window.process ?? { env: {} }; // Minimal process polyfill

export {};