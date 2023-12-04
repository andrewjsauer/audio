import React from 'react';
import Config from 'react-native-config';
import { Provider } from 'react-redux';

import './locales/index';
import './services/firebase/index';

import setupStore from './store';
import App from './components/App';

import StorybookUIRoot from '../.storybook/Storybook';

const store = setupStore();

function AppContainer(): JSX.Element {
  if (Config.showStorybook === 'true') return <StorybookUIRoot />;

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default AppContainer;
