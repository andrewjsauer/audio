import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { restorePurchases, purchaseProduct } from '@store/app/thunks';
import { selectIsLoading } from '@store/app/selectors';
import { selectUser } from '@store/auth/selectors';

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

function TrailScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  const handlePurchase = () => {
    trackEvent('start_trial_button_clicked');
    dispatch(purchaseProduct(user));
  };

  const handleRestorePurchases = () => {
    trackEvent('restore_purchases_button_clicked');
    dispatch(restorePurchases(user));
  };

  const date30DaysFromNow = new Date();
  date30DaysFromNow.setDate(date30DaysFromNow.getDate() + 30);
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
              {t('trialScreen.benefit2Description', { date: format(date30DaysFromNow, 'PPP') })}
            </Benefit2SubDescription>
          </Benefit2Container>
          <Benefit2Item>{t('trialScreen.price')}</Benefit2Item>
        </BenefitContainer>
      </Header>
      <Footer>
        <FooterTitle>{t('trialScreen.footer.title')}</FooterTitle>
        <FooterSubTitle>{t('trialScreen.footer.description')}</FooterSubTitle>
        <Button isLoading={isLoading} onPress={handlePurchase} text={t('trialScreen.footer.buttonText')} mode="dark" />
        <RestoreButton onPress={handleRestorePurchases} disabled={isLoading}>
          <RestoreButtonText>{t('trialScreen.footer.restoreButtonText')}</RestoreButtonText>
        </RestoreButton>
      </Footer>
    </Container>
  );
}

export default TrailScreen;
