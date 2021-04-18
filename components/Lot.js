import { VDom } from '../services/VDom.js';

/**
 * Returns single lot component
 * @param { object } { lot }
 * @return { HTMLElement } lot component
 */
export function Lot({ lot, key }) {
  return VDom.createElement(
    'article',
    { key, className: 'lot' },
    VDom.createElement('div', { className: 'price' }, lot.price),
    VDom.createElement('h1', {}, lot.price),
    VDom.createElement('p', {}, lot.description)
  );
}
