import React from 'react';
import {
  SafeAreaProvider,
  SafeAreaProviderProps,
} from 'react-native-safe-area-context';

type Props = React.PropsWithChildren<SafeAreaProviderProps>;

function AppSafeAreaProvider({ children, ...props }: Props) {
  return <SafeAreaProvider {...props}>{children}</SafeAreaProvider>;
}

export default AppSafeAreaProvider;
