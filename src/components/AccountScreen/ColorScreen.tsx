import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { updateUser } from '@store/auth/thunks';
import { selectUserData, selectIsLoading } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';
import { showNotification } from '@store/ui/slice';

import { trackEvent } from '@lib/analytics';

import ColorPicker from '@components/shared/ColorPicker';
import Layout from '@components/shared/Layout';

import LoadingView from '@components/shared/LoadingView';

import { ScreenContainer } from './style';

function ColorScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { color, id } = useSelector(selectUserData);
  const { color: colorOffLimits } = useSelector(selectPartnerData);
  const isLoading = useSelector(selectIsLoading);

  const handleChange = (selectedColor: string) => {
    if (color !== selectedColor) {
      trackEvent('Color Changed');
      dispatch(updateUser({ id, userDetails: { color: selectedColor } }));

      dispatch(
        showNotification({
          title: 'accountScreen.colorScreen.success',
          type: 'success',
        }),
      );
    }
  };

  return (
    <Layout titleKey="accountScreen.colorScreen.title" screen="Color Screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <ScreenContainer>
          <ColorPicker colorOffLimits={colorOffLimits} color={color} onChange={handleChange} />
        </ScreenContainer>
      )}
    </Layout>
  );
}

export default ColorScreen;
