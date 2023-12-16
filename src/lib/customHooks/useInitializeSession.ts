import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';

import { AppDispatch } from '@store/index';
import { selectUserId, selectUser } from '@store/auth/selectors';
import { initializeSession } from '@store/app/thunks';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (userId) {
      dispatch(initializeSession(user));
    }
  }, [userId, dispatch]);

  useAuthSubscription();
};

export default useInitializeSession;
