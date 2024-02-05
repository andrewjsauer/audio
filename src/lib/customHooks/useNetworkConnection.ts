import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addEventListener } from '@react-native-community/netinfo';

import { trackEvent } from '@lib/analytics';
import { setConnectionStatus } from '@store/app/slice';

const useNetworkConnection = () => {
  const dispatch = useDispatch();

  const handleConnectivityChange = (state: any) => {
    console.log('Connection type', state.type);
    dispatch(setConnectionStatus(state.isConnected));

    if (!state.isConnected) {
      trackEvent('Network Offline');
    }
  };

  useEffect(() => {
    const unsubscribe = addEventListener(handleConnectivityChange);
    return () => {
      unsubscribe();
    };
  });
};

export default useNetworkConnection;
