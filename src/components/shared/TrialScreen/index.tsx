import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Purchases from 'react-native-purchases';

import { Alert, ActivityIndicator } from 'react-native';

import { selectUser } from '@store/auth/selectors';
import Button from '@components/shared/Button';

import { Container, Title, PriceInfo } from './style';

function TrailScreen() {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const user = useSelector(selectUser);

  const startTrial = async () => {
    setIsPurchasing(true);
    try {
      await Purchases.purchaseProduct('yf_1799_1m_1m0');
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Error purchasing', e.message);
      }
    } finally {
      await user.getIdToken(true);
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    setIsPurchasing(true);
    try {
      await Purchases.restorePurchases();
    } catch (e) {
      Alert.alert('Error restoring', e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Container>
      {isPurchasing ? (
        <ActivityIndicator />
      ) : (
        <>
          <Title>Start your 30-Day Trial</Title>
          <PriceInfo>$17.99/month per couple</PriceInfo>
          <Button onPress={startTrial} text="Start Trial" mode="dark" />
          <Button
            onPress={restorePurchases}
            text="Restore Purchases"
            mode="light"
          />
        </>
      )}
    </Container>
  );
}

export default TrailScreen;
