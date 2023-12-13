import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';
import { fetchPartnerData } from '@store/partnership/thunks';

const usePartnershipDataSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchPartnerData(userId));
    }
  }, [userId, dispatch]);
};

export default usePartnershipDataSubscription;
