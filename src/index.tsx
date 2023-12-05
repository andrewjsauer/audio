import React from 'react';
import Config from 'react-native-config';
import { Provider } from 'react-redux';

import './locales/index';
import './services/firebase/index';
import './lib/ignoreLogs';

import setupStore from './store';
import App from './components/App';
import AppSafeAreaProvider from './components/shared/safeAreaProvider';
import MainErrorBoundary from './components/shared/error/mainErrorBoundary';

import StorybookUIRoot from '../.storybook/Storybook';

const store = setupStore();

function AppContainer(): JSX.Element {
  if (Config.showStorybook === 'true') return <StorybookUIRoot />;

  return (
    <AppSafeAreaProvider>
      <MainErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </MainErrorBoundary>
    </AppSafeAreaProvider>
  );
}

export default AppContainer;
