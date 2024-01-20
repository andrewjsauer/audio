import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import { View } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { selectIsPurchasing } from '@store/app/selectors';
import { selectUser, selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import Button from '@components/shared/Button';
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

  const isPurchasing = useSelector(selectIsPurchasing);
  const partnerData = useSelector(selectPartnerData);
  const user = useSelector(selectUser);
  const userData = useSelector(selectUserData);

  useEffect(() => {
    trackEvent('Trial Screen Seen');
  }, []);

  const handlePurchase = () => {
    trackEvent('start_trial_button_clicked');
    dispatch(purchaseProduct({ user, partnerData, productIdentifier: 'dq_999_1m_1m0' }));
  };

  const handleRestorePurchases = () => {
    trackEvent('restore_purchases_button_clicked');
    dispatch(restorePurchases());
  };

  const date30DaysFromNow = moment().add(30, 'days');
  return (
    <Container>
      <Header>
        <Title>{t('trialScreen.title')}</Title>
        <SubTitle>{t('trialScreen.subTitle')}</SubTitle>
        <BenefitContainer noTopBorder={false}>
          <ColorTextContainer>
            <ColorCircle color={userData.color} />
            <ColorCircle isSecond color={partnerData.color} />
            <Benefit1Description>{t('trialScreen.benefit1')}</Benefit1Description>
          </ColorTextContainer>
          <Benefit1Item>{t('trialScreen.free')}</Benefit1Item>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <ColorTextContainer>
            <ColorCircle color={partnerData.color} />
            <MonthlyText>{t('trialScreen.benefitMonthly')}</MonthlyText>
          </ColorTextContainer>
          <MonthlyPrice>({t('trialScreen.perPersonPrice')})</MonthlyPrice>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <ColorTextContainer>
            <ColorCircle color={userData.color} />
            <MonthlyText>{t('trialScreen.benefitMonthly')}</MonthlyText>
          </ColorTextContainer>
          <MonthlyPrice>({t('trialScreen.perPersonPrice')})</MonthlyPrice>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <Benefit2Container>
            <ColorTextContainer>
              <ColorCircle color={userData.color} />
              <ColorCircle isSecond color={partnerData.color} />
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
          {t('trialScreen.footer.description', { partnerName: partnerData.name })}
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
