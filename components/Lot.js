import { VDom } from '../services/VDom.js';

/**
 * Returns single lot component
 * @param { object } { lot }
 * @return { HTMLElement } lot component
 */
export function Lot({ lot }) {
  return React.createElement(
    'article',
    { className: 'lot' },
    React.createElement('div', { className: 'price' }, lot.price),
    React.createElement('h1', {}, lot.price),
    React.createElement('p', {}, lot.description)
  );
}
