import * as React from 'react';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
  SafeAreaProviderProps,
} from 'react-native-safe-area-context';

type Props = React.PropsWithChildren<SafeAreaProviderProps>;

function AppSafeAreaProvider({ children, ...props }: Props) {
  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => {
        if (insets) {
          return children;
        }
        return <SafeAreaProvider {...props}>{children}</SafeAreaProvider>;
      }}
    </SafeAreaInsetsContext.Consumer>
  );
}

export default AppSafeAreaProvider;
