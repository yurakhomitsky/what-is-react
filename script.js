import { Api } from './services/Api.js';
import { VDom } from './services/VDom.js';
// import { App } from './containers/App.js';

const stream = {
  subscribe(channel, listener) {
    const id = channel.split('-')[1];
    const normalizedId = id ? Number(id) : null;
    if (!normalizedId) return;

    const interval = setInterval(() => {
      listener({
        id: normalizedId,
        price: Math.round(Math.random() * 10 + 30)
      });
    }, 2000);

    return () => clearInterval(interval);
  }
};

const auctionInitialState = {
  lots: [],
  loading: false,
  loaded: false,
  error: null
};

const LOTS_LOADING_PENDING = 'LOTS_LOADING_PENDING';
const LOTS_LOADING_SUCCESS = 'LOTS_LOADING_SUCCESS';
const LOTS_LOADING_ERROR = 'LOTS_LOADING_ERROR';
const CHANGE_LOT_PRICE = 'CHANGE_LOT_PRICE';
const FAVORITE_LOT = 'FAVORITE_LOT';
const UNFAVORITE_LOT = 'UNFAVORITE_LOT';
const SET_LOADED = 'SET_LOADED';

function auctionReducer(state = auctionInitialState, action) {
  switch (action.type) {
    case LOTS_LOADING_PENDING:
      return {
        ...state,
        lots: [],
        loading: true,
        loaded: false,
        error: null
      };
    case LOTS_LOADING_SUCCESS:
      return {
        ...state,
        lots: action.lots,
        loading: false,
        loaded: true,
        error: null
      };
    case LOTS_LOADING_ERROR:
      return {
        ...state,
        lots: [],
        loading: false,
        loaded: false,
        error: action.error
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

function lotsLoadingPending() {
  return {
    type: LOTS_LOADING_PENDING,
  };
}

function lotsLoadingSuccess(lots) {
  return {
    type: LOTS_LOADING_SUCCESS,
    lots
  };
}

function lotsLoadingError(error) {
  return {
    type: LOTS_LOADING_ERROR,
    error
  };
}

function loadLots() {
  return (dispatch, getState, { Api }) => {
    dispatch(lotsLoadingPending());
    Api.get('/lots')
      .then((lots) => {
        dispatch(lotsLoadingSuccess(lots));
      })
      .catch((error) => dispatch(lotsLoadingError(error.message)));
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
  return (dispatch, getState, { Api }) => {
    Api.post(`/lots/${id}/favorite`).then(() => {
      dispatch(favoriteLot(id));
    });
  };
}

function unFavoriteAsync(id) {
  return (dispatch, getState, { Api }) => {
    Api.post(`/lots/${id}/unfavorite`).then(() => {
      dispatch(unFavoriteLot(id));
    });
  };
}

const thunk = ReduxThunk.default;

const store = Redux.createStore(
  Redux.combineReducers({
    auction: auctionReducer
  }),
  Redux.applyMiddleware(thunk.withExtraArgument({ Api, stream }))
);

function lotsMapStateToProps(state) {
  return {
    lots: state.auction.lots,
    loading: state.auction.loading,
    loaded: state.auction.loaded,
    error: state.auction.error
  };
}

const lotMapDispatchToProps = {
  favorite: favoriteLotAsync,
  unFavorite: unFavoriteAsync,
  subscribe: (id) => {
    return (dispatch, getState, { stream }) => {
      return stream.subscribe(`price-${id}`, (data) => {
        dispatch(changeLotPrice({ id: data.id, price: data.price }));
      });
    };
  }
};

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
export function Lot({ lot, subscribe, favorite, unFavorite }) {

  React.useEffect(() => {
    return subscribe(lot.id);
  }, [lot.id]);

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
export function Lots({ lots, loading, loaded, error, loadLots }) {
  React.useEffect(() => {
    if (!loaded && !loading && !error) {
      loadLots();
    }
  }, [loaded, loading, error]);

  if (error) {
    return 'Error!';
  }

  if (loading) {
    return <Loading />;
  }

  if (!loaded) {
    return null;
  }

  return (
    <div className="lots">
      {lots.map((lot) => (
        <LotContainer lot={lot} key={lot.id} />
      ))}
    </div>
  );
}

const LotsContainer = ReactRedux.connect(lotsMapStateToProps, { loadLots })(Lots);
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

function renderView(store) {
  ReactDOM.render(
    <ReactRedux.Provider store={store}>
      <App />
    </ReactRedux.Provider>,
    document.getElementById('root'));
}

// Init app
renderView(store);
