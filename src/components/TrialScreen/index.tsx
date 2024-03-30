import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { fetchPartnerData } from '@store/partnership/thunks';

import { selectIsPurchasing } from '@store/app/selectors';
import { selectUser } from '@store/auth/selectors';
import { selectPartnerData, selectIsLoadingPartnerData } from '@store/partnership/selectors';

import Button from '@components/shared/Button';
import LoadingView from '@components/shared/LoadingView';
import Layout from '@components/Auth/Layout';

import {
  Container,
  Footer,
  FooterSubTitle,
  FooterTitle,
  Header,
  RestoreButton,
  RestoreButtonText,
  SubTitleContainer,
  SubTitle,
  SubTitleHighPrice,
  SubTitlePrice,
  Title,
  TrailBreakdownContainer,
  Pill,
  BreakdownContainer,
  DayContainer,
  DayText,
  DayDescriptionText,
} from './style';

function TrialScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isLoadingPartnerData = useSelector(selectIsLoadingPartnerData);
  const isPurchasing = useSelector(selectIsPurchasing);
  const partnerData = useSelector(selectPartnerData);
  const user = useSelector(selectUser);

  useEffect(() => {
    trackEvent('Free Trial Screen Viewed');
    if (!partnerData && user?.uid) {
      dispatch(fetchPartnerData(user.uid));
    }
  }, []);

  const handlePurchase = () => {
    trackEvent('Start Trail Button Tapped');

    const productIdentifier = Platform.OS === 'ios' ? 'dq_999_1m_1m0' : 'dq_999_1m_1m0:dq-999-1m';
    dispatch(purchaseProduct({ user, partnerData, productIdentifier }));
  };

  const handleRestorePurchases = () => {
    trackEvent('Restore Button Tapped');
    dispatch(restorePurchases());
  };

  return isLoadingPartnerData ? (
    <LoadingView />
  ) : (
    <Layout isTrialComplete>
      <Container>
        <Header>
          <Title>{t('trialScreen.title')}</Title>
          <SubTitle>{t('trialScreen.subTitle')}</SubTitle>
          <SubTitleContainer>
            <SubTitleHighPrice>{t('trialScreen.subTitleHighPrice')}</SubTitleHighPrice>
            <SubTitlePrice>{t('trialScreen.subTitlePrice')}</SubTitlePrice>
          </SubTitleContainer>
          <TrailBreakdownContainer>
            <Pill />
            <BreakdownContainer>
              <DayContainer isMarginBottom>
                <DayText>{t('trialScreen.breakdown.day1')}</DayText>
                <DayDescriptionText>
                  {t('trialScreen.breakdown.day1Description')}
                </DayDescriptionText>
              </DayContainer>
              <DayContainer isMarginBottom>
                <DayText>{t('trialScreen.breakdown.day25')}</DayText>
                <DayDescriptionText>
                  {t('trialScreen.breakdown.day25Description')}
                </DayDescriptionText>
              </DayContainer>
              <DayContainer>
                <DayText>{t('trialScreen.breakdown.day30')}</DayText>
                <DayDescriptionText>
                  {t('trialScreen.breakdown.day30Description')}
                </DayDescriptionText>
              </DayContainer>
            </BreakdownContainer>
          </TrailBreakdownContainer>
        </Header>
        <Footer>
          <FooterTitle>{t('trialScreen.footer.title')}</FooterTitle>
          <FooterSubTitle>
            {t('trialScreen.footer.description', { partnerName: partnerData?.name })}
          </FooterSubTitle>
          <Button
            isLoading={isPurchasing}
            onPress={handlePurchase}
            text={t('trialScreen.footer.buttonText')}
            mode="green"
          />
          <RestoreButton onPress={handleRestorePurchases} disabled={isPurchasing}>
            <RestoreButtonText>{t('trialScreen.footer.restoreButtonText')}</RestoreButtonText>
          </RestoreButton>
        </Footer>
      </Container>
    </Layout>
  );
}

export default TrialScreen;
