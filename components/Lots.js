import { VDom } from '../services/VDom.js';
import { Loading } from './Loading.js';
import { Lot } from './Lot.js';
/**
 * Returns list of lot components
 * Shows loading component if there are no lots
 * @param { array } { lots }
 * @return { HTMLDivElement } list of lots components
 */
export function Lots({ lots }) {
  if (!lots || (Array.isArray(lots) && !lots.length)) {
    return React.createElement(Loading);
  }

  const lotsElements = lots.map((lot) => React.createElement(Lot, { lot, key: lot.id }));

  return React.createElement('div', { className: 'lots' }, lotsElements);
}
