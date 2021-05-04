import { VDom } from '../services/VDom.js';

/**
 * Returns single lot component
 * @param { object } { lot }
 * @return { HTMLElement } lot component
 */
export function Lot({ lot }) {
  return (
    <article className="lot">
      <div className="price">{lot.price}</div>
      <h1>{lot.name}</h1>
      <p>{lot.description}</p>
    </article>
  );
}
