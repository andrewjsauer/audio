import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { selectUser } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';

import { Description, Container, Title, ButtonText, Button, ButtonWrapper } from './style';

function Notification() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const partnerData = useSelector(selectPartnerData);

  const handleRestorePurchases = () => {
    trackEvent('restore_purchases_button_clicked');
    dispatch(restorePurchases());
  };

  const handleUpdatePayment = () => {
    trackEvent('update_payment_button_clicked');
    dispatch(purchaseProduct({ user, partnerData }));
  };

  return (
    <Container>
      <View>
        <Title>{t('questionScreen.nonSubscriberScreen.notification.title')}</Title>
        <Description>
          {t('questionScreen.nonSubscriberScreen.notification.description')}
        </Description>
      </View>
      <ButtonWrapper>
        <Button onPress={handleRestorePurchases}>
          <ButtonText>
            {t('questionScreen.nonSubscriberScreen.notification.restoreButtonText')}
          </ButtonText>
        </Button>
        <Button onPress={handleUpdatePayment}>
          <ButtonText>
            {t('questionScreen.nonSubscriberScreen.notification.updatePaymentButtonText')}
          </ButtonText>
        </Button>
      </ButtonWrapper>
    </Container>
  );
}

export default Notification;
