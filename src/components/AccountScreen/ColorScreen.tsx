import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { updateUser } from '@store/auth/thunks';
import { selectUserData, selectIsLoading } from '@store/auth/selectors';
import { showNotification } from '@store/ui/slice';

import { trackEvent } from '@lib/analytics';

import ColorPicker from '@components/shared/ColorPicker';
import Layout from '@components/shared/Layout';

import LoadingView from '@components/shared/LoadingView';

import { ScreenContainer } from './style';

function ColorScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { color, id } = useSelector(selectUserData);
  const isLoading = useSelector(selectIsLoading);

  const handleChange = (selectedColor: string) => {
    if (color !== selectedColor) {
      trackEvent('color_change_button_clicked');
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
    <Layout titleKey="accountScreen.colorScreen.title" screen="color_account_screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <ScreenContainer>
          <ColorPicker color={color} onChange={handleChange} />
        </ScreenContainer>
      )}
    </Layout>
  );
}

export default ColorScreen;