import './styles.css';

import { createExperience } from './app/createExperience';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('App container was not found.');
}

const dispose = createExperience(root);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    dispose();
  });
}
