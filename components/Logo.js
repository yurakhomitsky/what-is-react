import { VDom } from '../services/VDom.js';

/**
 * Returns logo component
 * @return { HTMLImageElement } clock component
 */
export function Logo() {
  return VDom.createElement('img', {
    className: 'logo',
    src: 'logo.png'
  });
}
