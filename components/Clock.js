import { VDom } from '../services/VDom.js';

/**
 * Returns clock component
 * @param { object } { time }
 * @return { HTMLDivElement } clock component
 */
export function Clock({ time }) {
  return VDom.createElement('div', { className: 'clock' }, time.toLocaleTimeString());
}
