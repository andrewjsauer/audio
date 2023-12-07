import React from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import ChevronLeft from '@assets/icons/chevron-left.svg';

import {
  KeyboardAvoidingView,
  Header,
  Title,
  LayoutContainer,
  BackButtonWrapper,
  View,
} from './style';

type LayoutProps = {
  goBack?: () => void;
  step: number;
  title?: string;
  children: React.ReactNode;
};

function Layout({ goBack, step, title, children }: LayoutProps) {
  return (
    <LayoutContainer>
      {step > 1 && (
        <Header>
          <BackButtonWrapper onPress={goBack}>
            <ChevronLeft width={30} height={30} />
          </BackButtonWrapper>
          <Title>{title}</Title>
        </Header>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LayoutContainer>
  );
}

export default Layout;
