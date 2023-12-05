import React from 'react';
import Config from 'react-native-config';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import './locales/index';
import './services/firebase/index';
import './lib/ignoreLogs';

import setupStore from './store';
import App from './components/App';
import AppSafeAreaProvider from './components/shared/safeAreaProvider';
import MainErrorBoundary from './components/shared/error/mainErrorBoundary';

import StorybookUIRoot from '../.storybook/Storybook';

const { store, persistor } = setupStore();

function AppContainer(): JSX.Element {
  if (Config.showStorybook === 'true') return <StorybookUIRoot />;

  return (
    <AppSafeAreaProvider>
      <MainErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </MainErrorBoundary>
    </AppSafeAreaProvider>
  );
}

export default AppContainer;
