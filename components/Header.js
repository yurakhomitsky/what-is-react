import { VDom } from '../services/VDom.js';
import { Logo } from './Logo.js';

/**
 * Returns header component and append logo component
 * @return { HTMLElement } header component
 */
export function Header() {
  return React.createElement(
    'header',
    {
      className: 'header'
    },
    React.createElement(Logo)
  );
}
