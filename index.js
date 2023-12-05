import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

import './src/lib/setupDebug';

import App from './src/index';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
