import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { selectUser } from '@store/auth/selectors';

import Button from '@components/shared/Button';
import { Container, Title, PriceInfo } from './style';

function TrailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const user = useSelector(selectUser);

  const handlePurchase = () => {
    trackEvent('start_trial_button_clicked');
    dispatch(purchaseProduct(user));
  };

  const handleRestorePurchases = () => {
    trackEvent('restore_purchases_button_clicked');
    dispatch(restorePurchases(user));
  };

  return (
    <Container>
      <Title>{t('trialScreen.title')}</Title>
      <PriceInfo>{t('trialScreen.description')}</PriceInfo>
      <Button
        onPress={handlePurchase}
        text={t('trialScreen.startTrialButtonText')}
        mode="dark"
      />
      <Button
        onPress={handleRestorePurchases}
        text={t('trialScreen.restoreButtonText')}
        mode="light"
      />
    </Container>
  );
}

export default TrailScreen;
