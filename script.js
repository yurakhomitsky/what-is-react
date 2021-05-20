import { Api } from './services/Api.js';
import { VDom } from './services/VDom.js';
// import { App } from './containers/App.js';



/**
 * Returns loading component
 * @return { HTMLDivElement } loading component
 */
export function Loading() {
  return <div className="loading">Loading...</div>;
}

/**
 * Returns clock component
 * @param { object } { time }
 * @return { HTMLDivElement } clock component
 */
export function Clock({ time }) {
  return <div className="clock">{time.toLocaleTimeString()}</div>;
}

/**
 * Returns logo component
 * @return { HTMLImageElement } clock component
 */
export function Logo() {
  return <img className="logo" src="logo.png" />;
}

/**
 * Returns header component and append logo component
 * @return { HTMLElement } header component
 */
export function Header() {
  return (
    <header className="header">
      <Logo />
    </header>
  );
}

/**
 * Returns single lot component
 * @param { object } { lot }
 * @return { HTMLElement } lot component
 */
export function Lot({ lot }) {
  return (
    <article className="lot">
      <div className="price">{lot.price}</div>
      <h1>{lot.name}</h1>
      <p>{lot.description}</p>
    </article>
  );
}
/**
 * Returns list of lot components
 * Shows loading component if there are no lots
 * @param { array } { lots }
 * @return { HTMLDivElement } list of lots components
 */
export function Lots({ lots }) {
  if (!lots || (Array.isArray(lots) && !lots.length)) {
    return <Loading />;
  }

  return (
    <div className="lots">
      {lots.map((lot) => (
        <Lot lot={lot} key={lot.id} />
      ))}
    </div>
  );
}

/**
 * Creates container and append components that needs to be rendered
 * @param {object} { state of app}
 * @return {HTMLDivElement } App with components
 */
export function App({ state }) {
  return (
    <div className="app">
      <Header />
      <Clock time={state.clock.time} />
      <Lots lots={state.auction.lots} />
    </div>
  );
}


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



// States
const clockInitialState = {
  time: new Date()
};
function clockReducer(state = clockInitialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_TIME:
      return {
        ...state,
        time: payload
      };
    default: return state;
  }
}

const auctionInitialState = {
  lots: null
};

const SET_TIME = 'SET_TIME';
const SET_LOTS = 'SET_LOTS';
const CHANGE_LOT_PRICE = 'CHANGE_LOT_PRICE';


function auctionReducer(state = auctionInitialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_LOTS:
      return {
        ...state,
        lots: payload
      };
    case CHANGE_LOT_PRICE:
      return {
        ...state,
        lots: state.lots.map((lot) => {
          if (lot.id === payload.id) {
            return {
              ...lot,
              price: payload.price
            };
          }
          return lot;
        })
      };
    default: return state;
  }
}
class Store {
  constructor(reducer, initialState) {
    this.reducer = reducer;
    this.state = reducer(initialState, { type: null });
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners.filter(listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.state));
  }
}

function combineReducer(reducers) {
  return (state = {}, action) => {
    return Object.entries(reducers).reduce((acc, [key, reducer]) => {
      acc[key] = reducer(state[key], action);
      return acc;
    }, {});
  };
}

const store = new Store(combineReducer({
  clock: clockReducer,
  auction: auctionReducer
}));


function renderView(state) {
  ReactDOM.render(<App state={state} />, document.getElementById('root'));
}

store.subscribe((state) => {
  renderView(state);
});

// Init app
renderView(store.getState());

function setTime(time) {
  return {
    type: SET_TIME,
    payload: time
  };
}

function setLots(lots) {
  return {
    type: SET_LOTS,
    payload: lots
  };
}

function changeLotPrice(lot) {
  return {
    type: CHANGE_LOT_PRICE,
    payload: lot
  };
}

// Change Clock time
setInterval(() => {
  store.dispatch(setTime(new Date()));
}, 1000);

// Fetch lots
Api.get('/lots').then((lots) => {
  store.dispatch(setLots(lots));
  // Simulate web-socket
  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, (data) => {
      store.dispatch(changeLotPrice({ id: data.id, price: data.price }));
    });
  });
});
