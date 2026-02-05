import * as ReactDOM from 'react-dom';
import * as Client from 'react-dom/client';

const shim = {
  ...ReactDOM,
  render: (element, container) => {
    if (!Client.createRoot) return null;
    const root = Client.createRoot(container);
    root.render(element);
    return root;
  },
  hydrate: (element, container) => {
    if (!Client.hydrateRoot) return null;
    return Client.hydrateRoot(container, element);
  },
  unmountComponentAtNode: () => {
    return true;
  }
};

export default shim;
export const { render, hydrate, unmountComponentAtNode, findDOMNode, createPortal } = shim;