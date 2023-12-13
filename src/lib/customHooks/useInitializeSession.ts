import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';
import { initializeSession } from '@store/app/thunks';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (userId) {
      dispatch(initializeSession(userId));
    }
  }, [userId, dispatch]);
};

export default useInitializeSession;
