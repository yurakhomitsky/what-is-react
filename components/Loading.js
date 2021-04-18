import { VDom } from '../services/VDom.js';

/**
 * Returns loading component
 * @return { HTMLDivElement } loading component
 */
export function Loading() {
  return VDom.createElement('div', { className: 'loading' }, 'Loading...');
}
