import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import { showNotification } from '@store/ui/slice';

import ColorPicker from '@components/shared/ColorPicker';
import Layout from '../Layout';

import {
  Container,
  ButtonWrapper,
  InputSubtitle,
  InputWrapper,
} from '../style';

import { TextInput } from './style';

function UserNameScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen('UserNameScreen');
  }, []);

  const { goToNextStep, userDetails, handleUserDetails } = useAuthFlow();
  const { name, color } = userDetails;

  const handleSubmit = () => {
    if (!color) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.colorEmpty',
          type: 'error',
        }),
      );

      trackEvent('users_color_empty_error');
      return;
    }

    if (!name) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.userNameEmpty',
          type: 'error',
        }),
      );

      trackEvent('users_name_empty_error');
      return;
    }

    goToNextStep();
  };

  return (
    <Layout
      isBackButtonEnabled={false}
      title={t('auth.userDetails.userNameScreen.title')}>
      <Container>
        <ColorPicker
          color={color}
          onChange={(colorOption) => handleUserDetails({ color: colorOption })}
        />
        <InputWrapper>
          <TextInput
            placeholder={t('auth.userDetails.userNameScreen.inputPlaceholder')}
            keyboardType="default"
            onChangeText={(typedName) => handleUserDetails({ name: typedName })}
            autoCapitalize="words"
            returnKeyType="next"
            value={name}
          />
          <InputSubtitle>
            {t('auth.userDetails.userNameScreen.inputDescription')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default UserNameScreen;
