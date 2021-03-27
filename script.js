// Helpers
const api = {
  get(url) {
    switch (url) {
      case '/lots':
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([
              {
                id: 1,
                name: 'Apple',
                description: 'Apple description',
                price: 16
              },
              {
                id: 2,
                name: 'Orange',
                description: 'Orange descriptions',
                price: 4
              }
            ]);
          }, 2000);
        });
      default:
        throw new Error('Unknown address');
    }
  }
};

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

// Components
/**
 * Returns header component and append logo component
 * @return { HTMLElement } header component
 */
function Header() {
  const header = document.createElement('header');
  header.className = 'header';
  header.append(Logo());

  return header;
}

/**
 * Returns logo component
 * @return { HTMLImageElement } clock component
 */
function Logo() {
  const logo = document.createElement('img');
  logo.className = 'logo';
  logo.src = 'logo.png';
  return logo;
}

/**
 * Returns clock component
 * @param { object } { time }
 * @return { HTMLDivElement } clock component
 */
function Clock({ time }) {
  const clock = document.createElement('div');
  clock.className = 'clock';
  clock.innerText = time.toLocaleTimeString();
  return clock;
}

/**
 * Returns loading component
 * @return { HTMLDivElement } loading component
 */
function Loading() {
  const node = document.createElement('div');
  node.className = 'loading';
  node.innerText = 'Loading...';
  return node;
}

/**
 * Returns list of lot components
 * Shows loading component if there are no lots
 * @param { array } { lots }
 * @return { HTMLDivElement } list of lots components
 */
function Lots({ lots }) {
  const list = document.createElement('div');

  if (!lots || (Array.isArray(lots) && !lots.length)) {
    return Loading();
  }

  list.className = 'lots';

  lots.forEach((lot) => {
    list.append(Lot({ lot }));
  });
  return list;
}

/**
 * Returns single lot component
 * @param { object } { lot }
 * @return { HTMLElement } lot component
 */
function Lot({ lot }) {
  const article = document.createElement('article');
  article.className = 'lot';
  article.dataset.key = lot.id;

  const price = document.createElement('div');
  price.className = 'price';
  price.innerText = lot.price;
  article.append(price);

  const name = document.createElement('h1');
  name.innerText = lot.name;
  article.append(name);

  const description = document.createElement('p');
  description.innerText = lot.description;
  article.append(description);

  return article;
}

/**
 * Creates container and append components that needs to be rendered
 * @param {object} { state of app}
 * @return {HTMLDivElement } App with components
 */
function App({ state }) {
  const app = document.createElement('div');
  app.className = 'app';
  app.append(Header());
  app.append(Clock({ time: state.time }));
  app.append(Lots({ lots: state.lots }));
  return app;
}

// Application methods
function renderView(state) {
  render(App({ state }), document.getElementById('root'));
}

function render(virtualDom, realDomRoot) {
  // add parent root element for virtual
  // virtual#app real#root -> virtual#root -> virtual#app
  const virtualDomRoot = document.createElement(realDomRoot.tagName);
  virtualDomRoot.id = realDomRoot.id;
  virtualDomRoot.append(virtualDom);

  sync(virtualDomRoot, realDomRoot);
}

function sync(virtualNode, realNode) {
  // Sync element
  if (virtualNode.id !== realNode.id) {
    realNode.id = virtualNode.id;
  }

  if (virtualNode.className !== realNode.className) {
    realNode.className = virtualNode.className;
  }

  if (virtualNode.attributes) {
    Array.from(virtualNode.attributes).forEach((attr) => {
      realNode[attr.name] = attr.value;
    });
  }

  if (virtualNode.dataset) {
    Object.keys(virtualNode.dataset).forEach((key) => {
      realNode.dataset[key] = virtualNode.dataset[key];
    });
  }

  if (virtualNode.nodeValue !== realNode.nodeValue) {
    realNode.nodeValue = virtualNode.nodeValue;
  }

  // Sync child nodes
  const virtualChildren = virtualNode.childNodes;
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
      if (virtual.tagName === real.tagName) {
        sync(virtual, real);
      }

      // Replace
      if (virtual.tagName !== real.tagName) {
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
  // if virtual node has TEXT_NODE type then
  // we need create approporiate node for it
  if (virtual.nodeType === Node.TEXT_NODE) {
    return document.createTextNode('');
  }
  return document.createElement(virtual.tagName);
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
  // Alternative way to replace Clock component instead re-render whole app

  // const time = new Date();
  // const clock = domRoot.querySelector('.clock');
  // const newClock = Clock({ time });
  // clock.replaceWith(newClock);
}, 1000);

// Fetch lots
api.get('/lots').then((lots) => {
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
