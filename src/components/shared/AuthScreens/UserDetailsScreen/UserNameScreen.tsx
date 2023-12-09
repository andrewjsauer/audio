import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { UserDetailsSteps as Steps } from '@lib/types';
import { showNotification } from '@store/ui/slice';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputSubtitle,
  InputWrapper,
} from '../style';
import {
  TextInput,
  ColorPickerRow,
  ColorPickerContainer,
  ColorOption,
} from './style';

const row1 = [
  '#175419',
  '#397729',
  '#62BE8D',
  '#82A326',
  '#BC5252',
  '#E27140',
  '#EBA741',
  '#F3CC03',
];

const row2 = [
  '#164780',
  '#1B6470',
  '#505883',
  '#937AC8',
  '#9C3D76',
  '#BD3C6A',
  '#D394E3',
  '#E1A3C8',
];

function PartnerNameScreen() {
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
          title: t('errors.pleaseTryAgain'),
          description: t('errors.colorEmpty'),
          type: 'error',
        }),
      );

      trackEvent('users_color_empty');
      return;
    }

    if (!name) {
      dispatch(
        showNotification({
          title: t('errors.pleaseTryAgain'),
          description: t('errors.userNameEmpty'),
          type: 'error',
        }),
      );

      trackEvent('users_name_empty');
      return;
    }

    goToNextStep(Steps.BirthdayStep);
  };

  return (
    <Layout
      isBackButtonEnabled={false}
      title={t('auth.userDetails.userNameScreen.title')}>
      <Container>
        <ColorPickerContainer>
          <ColorPickerRow>
            {row1.map((colorOption) => (
              <ColorOption
                key={colorOption}
                color={colorOption}
                isSelected={colorOption === color}
                onPress={() => handleUserDetails({ color: colorOption })}
              />
            ))}
          </ColorPickerRow>
          <ColorPickerRow>
            {row2.map((colorOption) => (
              <ColorOption
                key={colorOption}
                color={colorOption}
                isSelected={colorOption === color}
                onPress={() => handleUserDetails({ color: colorOption })}
              />
            ))}
          </ColorPickerRow>
        </ColorPickerContainer>
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

export default PartnerNameScreen;
