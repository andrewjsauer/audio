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
  children: React.ReactNode;
  goBack?: () => void;
  isBackButtonEnabled?: boolean;
  isHeaderEnabled?: boolean;
  title?: string;
};

function Layout({
  children,
  goBack,
  isBackButtonEnabled = true,
  isHeaderEnabled = true,
  title,
}: LayoutProps) {
  return (
    <LayoutContainer>
      {isHeaderEnabled && (
        <Header isAddedPadding={!isBackButtonEnabled}>
          {isBackButtonEnabled && (
            <BackButtonWrapper onPress={goBack}>
              <ChevronLeft width={30} height={30} />
            </BackButtonWrapper>
          )}
          <Title isLeftMargin={isBackButtonEnabled}>{title}</Title>
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