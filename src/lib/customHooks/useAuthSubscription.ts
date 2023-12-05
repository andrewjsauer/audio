import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import auth from '@react-native-firebase/auth';
import { setUser } from '@store/auth/slice';

const useAuthSubscription = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      dispatch(setUser(user));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);
};

export default useAuthSubscription;
