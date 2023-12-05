import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '../../assets/icons/logo.svg';
import {
  Container,
  Title,
  Subtitle,
  SignInButton,
  SignInButtonText,
} from './style';

function SignInScreen() {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>You First</Title>
      <Subtitle>
        Couples Edition{'\n'}Reveal each others’ answers to daily questions
      </Subtitle>
      <SignInButton onPress={() => console.log('Sign In pressed')}>
        <SignInButtonText>Sign In</SignInButtonText>
      </SignInButton>
      <Logo width={110} height={80} />
    </Container>
  );
}

export default SignInScreen;
