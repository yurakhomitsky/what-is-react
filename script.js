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
export function Lot({ lot, favorite, unFavorite }) {

  return (
    <article className={`lot ${lot.isFavorite ? 'favorite' : ''}`}>
      <div className="price">{lot.price}</div>
      <h1>{lot.name}</h1>
      <p>{lot.description}</p>
      <Favorite isFavorite={lot.isFavorite} favorite={favorite.bind(null, lot.id)} unFavorite={unFavorite.bind(null, lot.id)} />
    </article>
  );
}

function Favorite({ isFavorite, favorite, unFavorite }) {
  const unFavoriteButton = <button type="button" onClick={favorite} className="unfavorite">Unfavorite</button>;
  const favoriteButton = <button type="button" onClick={unFavorite} className="favorite">Favorite</button>;
  return isFavorite ? favoriteButton : unFavoriteButton;
}


/**
 * Returns list of lot components
 * Shows loading component if there are no lots
 * @param { array } { lots }
 * @return { HTMLDivElement } list of lots components
 */
export function Lots({ lots, favorite, unFavorite }) {
  if (!lots || (Array.isArray(lots) && !lots.length)) {
    return <Loading />;
  }

  return (
    <div className="lots">
      {lots.map((lot) => (
        <Lot lot={lot} favorite={favorite} unFavorite={unFavorite} key={lot.id} />
      ))}
    </div>
  );
}

/**
 * Creates container and append components that needs to be rendered
 * @param {object} { state of app}
 * @return {HTMLDivElement } App with components
 */
export function App({ state, favorite, unFavorite }) {
  return (
    <div className="app">
      <Header />
      <Clock time={state.clock.time} />
      <Lots lots={state.auction.lots} favorite={favorite} unFavorite={unFavorite} />
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

  switch (action.type) {
    case SET_TIME:
      return {
        ...state,
        time: action.time
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
const FAVORITE_LOT = 'FAVORITE_LOT';
const UNFAVORITE_LOT = 'UNFAVORITE_LOT';


function auctionReducer(state = auctionInitialState, action) {

  switch (action.type) {
    case SET_LOTS:
      return {
        ...state,
        lots: action.lots
      };
    case CHANGE_LOT_PRICE:
      return {
        ...state,
        lots: state.lots.map((lot) => {
          if (lot.id === action.lot.id) {
            return {
              ...lot,
              price: action.lot.price
            };
          }
          return lot;
        })
      };
    case FAVORITE_LOT:
      return {
        ...state,
        lots: state.lots.map((lot) => {
          if (lot.id === action.id) {
            return {
              ...lot,
              isFavorite: true
            };
          }
          return lot;
        })
      };
    case UNFAVORITE_LOT:
      return {
        ...state,
        lots: state.lots.map((lot) => {
          if (lot.id === action.id) {
            return {
              ...lot,
              isFavorite: false
            };
          }
          return lot;
        })
      };
    default: return state;
  }
}

function setTime(time) {
  return {
    type: SET_TIME,
    time
  };
}

function setLots(lots) {
  return {
    type: SET_LOTS,
    lots
  };
}

function changeLotPrice(lot) {
  return {
    type: CHANGE_LOT_PRICE,
    lot
  };
}

function favoriteLot(id) {
  return {
    type: FAVORITE_LOT,
    id
  };
}

function unFavoriteLot(id) {
  return {
    type: UNFAVORITE_LOT,
    id
  };
}




const store = Redux.createStore(Redux.combineReducers({
  clock: clockReducer,
  auction: auctionReducer
}));


function renderView(store) {
  const state = store.getState();
  function favorite(id) {
    Api.post(`/lots/${id}/favorite`).then(() => {
      store.dispatch(favoriteLot(id));
    });

  }
  function unFavorite(id) {
    Api.post(`/lots/${id}/unfavorite`).then(() => {
      store.dispatch(unFavoriteLot(id));
    });

  }

  ReactDOM.render(<App state={state} favorite={favorite} unFavorite={unFavorite} />, document.getElementById('root'));
}

store.subscribe(() => {
  renderView(store);
});

// Init app
renderView(store);

// setTimeout(() => {
//   store.dispatch(setTime(new Date()));
// }, 2500);

// Change Clock time
setInterval(() => {
  store.dispatch(setTime(new Date()));
}, 3000);

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
