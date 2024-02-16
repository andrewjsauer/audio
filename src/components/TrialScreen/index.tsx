import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import { View, Platform } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { fetchPartnerData } from '@store/partnership/thunks';

import { selectIsPurchasing } from '@store/app/selectors';
import { selectUser, selectUserData } from '@store/auth/selectors';
import { selectPartnerData, selectIsLoadingPartnerData } from '@store/partnership/selectors';

import Button from '@components/shared/Button';
import LoadingView from '@components/shared/LoadingView';

import Checkmark from '@assets/icons/check.svg';

import {
  Benefit1Description,
  Benefit1Item,
  Benefit2Container,
  Benefit2Description,
  Benefit2Item,
  Benefit2SubDescription,
  BenefitContainer,
  ColorCircle,
  ColorTextContainer,
  Container,
  Footer,
  FooterSubTitle,
  FooterTitle,
  Header,
  MonthlyPrice,
  MonthlyText,
  RestoreButton,
  RestoreButtonText,
  SubTitle,
  Title,
} from './style';

function TrialScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isLoadingPartnerData = useSelector(selectIsLoadingPartnerData);
  const isPurchasing = useSelector(selectIsPurchasing);
  const partnerData = useSelector(selectPartnerData);
  const user = useSelector(selectUser);
  const userData = useSelector(selectUserData);

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

  const date30DaysFromNow = moment().add(30, 'days');
  return isLoadingPartnerData ? (
    <LoadingView />
  ) : (
    <Container>
      <Header>
        <Title>{t('trialScreen.title')}</Title>
        <SubTitle>{t('trialScreen.subTitle')}</SubTitle>
        <BenefitContainer noTopBorder={false}>
          <ColorTextContainer>
            <ColorCircle color={userData?.color}>
              <Checkmark width={16} height={16} />
            </ColorCircle>
            <ColorCircle isSecond color={partnerData?.color}>
              <Checkmark width={16} height={16} />
            </ColorCircle>
            <Benefit1Description>{t('trialScreen.benefit1')}</Benefit1Description>
          </ColorTextContainer>
          <Benefit1Item>{t('trialScreen.free')}</Benefit1Item>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <ColorTextContainer>
            <ColorCircle color={partnerData?.color}>
              <Checkmark width={16} height={16} />
            </ColorCircle>
            <MonthlyText>{t('trialScreen.benefitMonthly')}</MonthlyText>
          </ColorTextContainer>
          <MonthlyPrice>({t('trialScreen.perPersonPrice')})</MonthlyPrice>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <ColorTextContainer>
            <ColorCircle color={userData?.color}>
              <Checkmark width={16} height={16} />
            </ColorCircle>
            <MonthlyText>{t('trialScreen.benefitMonthly')}</MonthlyText>
          </ColorTextContainer>
          <MonthlyPrice>({t('trialScreen.perPersonPrice')})</MonthlyPrice>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <Benefit2Container>
            <ColorTextContainer>
              <ColorCircle color={userData?.color}>
                <Checkmark width={16} height={16} />
              </ColorCircle>
              <ColorCircle isSecond color={partnerData?.color}>
                <Checkmark width={16} height={16} />
              </ColorCircle>
              <View>
                <Benefit2Description>{t('trialScreen.benefit2')}</Benefit2Description>
                <Benefit2SubDescription>
                  {t('trialScreen.benefit2Description', { date: date30DaysFromNow.format('LL') })}
                </Benefit2SubDescription>
              </View>
            </ColorTextContainer>
          </Benefit2Container>
          <Benefit2Item>{t('trialScreen.price')}</Benefit2Item>
        </BenefitContainer>
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
          mode="dark"
        />
        <RestoreButton onPress={handleRestorePurchases} disabled={isPurchasing}>
          <RestoreButtonText>{t('trialScreen.footer.restoreButtonText')}</RestoreButtonText>
        </RestoreButton>
      </Footer>
    </Container>
  );
}

export default TrialScreen;
