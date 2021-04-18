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
  ReactDOM.render(React.createElement(App, { state }), document.getElementById('root'));
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
