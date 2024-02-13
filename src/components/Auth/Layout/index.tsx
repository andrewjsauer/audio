import React from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import ChevronLeft from '@assets/icons/chevron-left.svg';
import { KeyboardAvoidingView, Header, LayoutContainer, BackButtonWrapper, View } from './style';

type LayoutProps = {
  children: React.ReactNode;
  goBack?: () => void;
  isBackButtonEnabled?: boolean;
  isHeaderDisabled?: boolean;
};

function Layout({
  children,
  goBack,
  isBackButtonEnabled = true,
  isHeaderDisabled = false,
}: LayoutProps) {
  return (
    <LayoutContainer>
      {isHeaderDisabled && (
        <Header isAddedPadding={!isBackButtonEnabled} isAndroidMarginTop={Platform.OS !== 'ios'}>
          <BackButtonWrapper onPress={goBack}>
            <ChevronLeft width={30} height={30} />
          </BackButtonWrapper>
        </Header>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LayoutContainer>
  );
}

export default Layout;
