import React from 'react';
import Config from 'react-native-config';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { NavigationContainer } from '@react-navigation/native';

import './locales/index';
import './services/firebase/index';
import './lib/ignoreLogs';

import setupStore from './store';
import App from './components/App';
import AppSafeAreaProvider from './components/shared/SafeAreaProvider';
import NotificationProvider from './components/shared/NotificationProvider';
import MainErrorBoundary from './components/shared/ErrorScreens/MainErrorBoundary';
import theme from './styles/theme';

import StorybookUIRoot from '../.storybook/Storybook';

const { store, persistor } = setupStore();

function AppContainer(): JSX.Element {
  if (Config.showStorybook === 'true') return <StorybookUIRoot />;

  return (
    <ThemeProvider theme={theme}>
      <AppSafeAreaProvider>
        <MainErrorBoundary>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NavigationContainer>
                <NotificationProvider />
                <App />
              </NavigationContainer>
            </PersistGate>
          </Provider>
        </MainErrorBoundary>
      </AppSafeAreaProvider>
    </ThemeProvider>
  );
}

export default AppContainer;
