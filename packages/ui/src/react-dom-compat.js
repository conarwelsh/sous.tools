"use client";

import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOMReal from 'react-dom-real';

// Named exports for compatibility with react-native-web
export const render = (element, container, callback) => {
  try {
    const root = ReactDOMClient.createRoot(container);
    root.render(element);
    if (callback) callback();
    return root;
  } catch (e) {
    console.error('ReactDOM.render shim failed:', e);
    return null;
  }
};

export const hydrate = (element, container, callback) => {
  try {
    const root = ReactDOMClient.hydrateRoot(container, element);
    if (callback) callback();
    return root;
  } catch (e) {
    console.error('ReactDOM.hydrate shim failed:', e);
    return null;
  }
};

export const unmountComponentAtNode = (container) => {
  return true; 
};

export const findDOMNode = (component) => {
  return null;
};

// Re-export all other members of the real ReactDOM
export const createPortal = ReactDOMReal.createPortal;
export const version = ReactDOMReal.version;
export const flushSync = ReactDOMReal.flushSync;
export const unstable_batchedUpdates = ReactDOMReal.unstable_batchedUpdates;

// React 19 specific members
export const prefetchDNS = ReactDOMReal.prefetchDNS;
export const preconnect = ReactDOMReal.preconnect;
export const preload = ReactDOMReal.preload;
export const preloadModule = ReactDOMReal.preloadModule;
export const preinit = ReactDOMReal.preinit;
export const preinitModule = ReactDOMReal.preinitModule;
export const useFormState = ReactDOMReal.useFormState;
export const useFormStatus = ReactDOMReal.useFormStatus;

// Default export using a Proxy to handle any other members
const shim = new Proxy(ReactDOMReal, {
  get(target, prop) {
    if (prop === 'render') return render;
    if (prop === 'hydrate') return hydrate;
    if (prop === 'unmountComponentAtNode') return unmountComponentAtNode;
    if (prop === 'findDOMNode') return findDOMNode;
    if (prop === 'default') return shim;
    if (prop === '__esModule') return true;
    return target[prop];
  }
});

export default shim;