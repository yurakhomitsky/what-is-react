import { Api } from './services/Api.js';
import { VDom } from './services/VDom.js';
import { App } from './containers/App.js';

const stream = {
  subscribe(channel, listener) {
    const id = channel.split('-')[1];
    const normalizedId = id ? Number(id) : null;

    if (normalizedId) {
      setInterval(() => {
        listener({
          id: normalizedId,
          price: Math.round(Math.random() * 10 + 30)
        });
      }, 2000);
    }
  }
};

function onPrice(data) {
  const lots = state.lots.map((lot) => {
    if (lot.id === data.id) {
      return {
        ...lot,
        price: data.price
      };
    }
    return lot;
  });

  state = {
    ...state,
    lots
  };

  renderView(state);
}

// State
let state = {
  time: new Date(),
  lots: null
};

// Application methods
function renderView(state) {
  render(VDom.createElement(App, { state }), document.getElementById('root'));
}

function render(virtualDom, realDomRoot) {
  // add parent root element for virtual
  // virtual#app real#root -> virtual#root -> virtual#app
  const evaluatedVirtualDom = evaluate(virtualDom);

  const virtualDomRoot = {
    type: realDomRoot.tagName.toLowerCase(),
    props: {
      id: realDomRoot.id,
      ...realDomRoot.attributes,
      children: [evaluatedVirtualDom]
    }
  };

  sync(virtualDomRoot, realDomRoot);
}

function evaluate(virtualNode) {
  // if node is string, number etc we just return that node
  if (typeof virtualNode !== 'object') {
    return virtualNode;
  }

  // virtualNode is object
  const { type, props = {} } = virtualNode;

  if (typeof type === 'function') {
    return evaluate(type(props));
  }

  const children = Array.isArray(props.children) ? props.children.map(evaluate) : [evaluate(props.children)];

  return {
    ...virtualNode,
    props: {
      ...props,
      children
    }
  };
}

function sync(virtualNode, realNode) {
  const { key, props = {} } = virtualNode;
  const hasPropertiesInProps = !!Object.keys(props).length;

  if (hasPropertiesInProps) {
    Object.entries(props).forEach(([name, value]) => {
      // we don't want to pass children array or key propertie to node
      if (name === 'children' || name === 'key') return;

      if (realNode[name] !== value) {
        realNode[name] = value;
      }
    });
  }

  if (key) {
    realNode.dataset.key = key;
  }

  if (typeof virtualNode !== 'object' && virtualNode !== realNode.nodeValue) {
    realNode.nodeValue = virtualNode;
  }

  // Sync child nodes
  const virtualChildren = hasPropertiesInProps ? props.children || [] : [];
  const realChildren = realNode.childNodes;

  // loop through children nodes
  for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
    // TODO: Implement removing nodes comparing by key
    const virtual = virtualChildren[i];
    const real = realChildren[i];

    // Remove
    // if we have real node for which we don't have virtual then
    // we remove that node from real
    if (!virtual && real) {
      realNode.remove(real);
    }

    if (virtual && real) {
      // Update
      // If we have same tagName then we need to sync attributes or properties
      if ((virtual.type || '') === (real.tagName || '').toLowerCase()) {
        sync(virtual, real);
      }

      // Replace
      if ((virtual.type || '') !== (real.tagName || '').toLowerCase()) {
        const newRealNode = createRealNodeByVirtual(virtual);
        sync(virtual, newRealNode);
        realNode.replaceChild(newRealNode, real);
      }
    }

    // Add
    // If in virtual we have nodes but in real we don't have them
    // then we creating nodes from virtual and append to the real one
    if (virtual && !real) {
      const newRealNode = createRealNodeByVirtual(virtual);
      sync(virtual, newRealNode);
      realNode.appendChild(newRealNode);
    }
  }
}

function createRealNodeByVirtual(virtual) {
  if (typeof virtual !== 'object') {
    return document.createTextNode(virtual);
  }
  return document.createElement(virtual.type);
}

// Init app
renderView(state);

// // Change Clock time
setInterval(() => {
  state = {
    ...state,
    time: new Date()
  };

  renderView(state);
}, 1000);

// Fetch lots
Api.get('/lots').then((lots) => {
  state = {
    ...state,
    lots
  };

  renderView(state);

  // Simulate web-socket
  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, onPrice);
  });
});
