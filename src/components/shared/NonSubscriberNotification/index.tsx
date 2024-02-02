import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { selectUser } from '@store/auth/selectors';
import { selectIsPurchasing } from '@store/app/selectors';
import { selectPartnerData } from '@store/partnership/selectors';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';

import { Description, Container, Title, ButtonText, Button, ButtonWrapper } from './style';

function NonSubscriberNotification() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const partnerData = useSelector(selectPartnerData);
  const isLoading = useSelector(selectIsPurchasing);

  useEffect(() => {
    trackEvent('Resubscribe Prompt Viewed');
  }, []);

  const handleRestorePurchases = () => {
    trackEvent('Restore Purchases Button Tapped');
    dispatch(restorePurchases());
  };

  const handleUpdatePayment = () => {
    trackEvent('Subscribe Button Tapped');
    dispatch(purchaseProduct({ user, partnerData, productIdentifier: 'dq_999_1m_1m0' }));
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
        <Button onPress={handleUpdatePayment} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ButtonText>
              {t('questionScreen.nonSubscriberScreen.notification.updatePaymentButtonText')}
            </ButtonText>
          )}
        </Button>
        <Button onPress={handleRestorePurchases} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <ButtonText>
              {t('questionScreen.nonSubscriberScreen.notification.restoreButtonText')}
            </ButtonText>
          )}
        </Button>
      </ButtonWrapper>
    </Container>
  );
}

export default NonSubscriberNotification;
