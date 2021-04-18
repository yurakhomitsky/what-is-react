import { VDom } from '../services/VDom.js';

/**
 * Returns clock component
 * @param { object } { time }
 * @return { HTMLDivElement } clock component
 */
export function Clock({ time }) {
  return React.createElement('div', { className: 'clock' }, time.toLocaleTimeString());
}
