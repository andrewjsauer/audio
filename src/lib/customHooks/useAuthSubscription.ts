import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';

import { setUser } from '@store/auth/slice';

function useAuthStateListener() {
  const dispatch = useDispatch();

  function onAuthStateChanged(user: any) {
    if (user) {
      crashlytics().setUserId(user.uid);
      crashlytics().setAttributes({
        name: user.displayName || '',
      });

      dispatch(setUser(user));
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);
}

export default useAuthStateListener;
