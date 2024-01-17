import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';

import { trackEvent, trackScreen } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { selectIsPurchasing } from '@store/app/selectors';
import { selectUser } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import Button from '@components/shared/Button';
import {
  Header,
  SubTitle,
  Container,
  Title,
  Footer,
  Benefit1Description,
  Benefit2Description,
  BenefitContainer,
  Benefit1Item,
  Benefit2Item,
  FooterSubTitle,
  FooterTitle,
  RestoreButton,
  RestoreButtonText,
  Benefit2SubDescription,
  Benefit2Container,
} from './style';

function TrialScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isPurchasing = useSelector(selectIsPurchasing);
  const partnerData = useSelector(selectPartnerData);
  const user = useSelector(selectUser);

  useEffect(() => {
    trackScreen('TrialScreen');
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
          <Benefit1Description>{t('trialScreen.benefit1')}</Benefit1Description>
          <Benefit1Item>{t('trialScreen.free')}</Benefit1Item>
        </BenefitContainer>
        <BenefitContainer noTopBorder>
          <Benefit2Container>
            <Benefit2Description>{t('trialScreen.benefit2')}</Benefit2Description>
            <Benefit2SubDescription>
              {t('trialScreen.benefit2Description', { date: date30DaysFromNow.format('LL') })}
            </Benefit2SubDescription>
          </Benefit2Container>
          <Benefit2Item>{t('trialScreen.price')}</Benefit2Item>
        </BenefitContainer>
      </Header>
      <Footer>
        <FooterTitle>{t('trialScreen.footer.title')}</FooterTitle>
        <FooterSubTitle>{t('trialScreen.footer.description')}</FooterSubTitle>
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
