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
 * @return { HTMLDivElement } clock component
 */
export function Clock({ time }) {
  return <div className="clock">{time.toLocaleTimeString()}</div>;
}

function ClockContainer() {
  const [time, setTime] = React.useState(new Date());
  const tick = () => {
    setTime(new Date());
  };

  React.useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);


  return <Clock time={time} />;
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
export function Lots({ lots }) {
  if (!lots || (Array.isArray(lots) && !lots.length)) {
    return <Loading />;
  }

  return (
    <div className="lots">
      {lots.map((lot) => (
        <LotContainer lot={lot} key={lot.id} />
      ))}
    </div>
  );
}


function lotsMapStateToProps(state) {
  return {
    lots: state.auction.lots
  };
}

const lotMapDispatchToProps = {
  favorite: favoriteLotAsync,
  unFavorite: unFavoriteAsync
};

const LotsContainer = ReactRedux.connect(lotsMapStateToProps)(Lots);
const LotContainer = ReactRedux.connect(null, lotMapDispatchToProps)(Lot);

/**
 * Creates container and append components that needs to be rendered
 * @param {object} { state of app}
 * @return {HTMLDivElement } App with components
 */
export function App() {
  return (
    <div className="app">
      <Header />
      <ClockContainer />
      <LotsContainer />
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
;

const auctionInitialState = {
  lots: null
};

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

function favoriteLotAsync(id) {
  return (dispatch, getState, Api) => {
    Api.post(`/lots/${id}/favorite`).then(() => {
      dispatch(favoriteLot(id));
    });
  };
}

function unFavoriteAsync(id) {
  return (dispatch, getState, api) => {
    api.post(`/lots/${id}/unfavorite`).then(() => {
      dispatch(unFavoriteLot(id));
    });
  };
}

const thunk = ReduxThunk.default;

const store = Redux.createStore(
  Redux.combineReducers({
    auction: auctionReducer
  }),
  Redux.applyMiddleware(thunk.withExtraArgument(Api))
);


function renderView(store) {
  ReactDOM.render(
    <ReactRedux.Provider store={store}>
      <App />
    </ReactRedux.Provider>,
    document.getElementById('root'));
}

// Init app
renderView(store);


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
