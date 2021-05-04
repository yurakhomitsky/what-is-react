import { VDom } from '../services/VDom.js';
import { Header, Clock, Lots } from '../components/index.js';
/**
 * Creates container and append components that needs to be rendered
 * @param {object} { state of app}
 * @return {HTMLDivElement } App with components
 */
export function App({ state }) {
  return (
    <div className="app">
      <Header />
      <Clock time={state.time} />
      <Lots lots={state.lots} />
    </div>
  );
}
