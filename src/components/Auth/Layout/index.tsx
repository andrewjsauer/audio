import React from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChevronLeft from '@assets/icons/chevron-left.svg';

import { KeyboardAvoidingView, Header, Title, LayoutContainer, BackButtonWrapper, View } from './style';

type LayoutProps = {
  children: React.ReactNode;
  goBack?: () => void;
  isBackButtonEnabled?: boolean;
  isHeaderEnabled?: boolean;
  title?: string;
};

function Layout({ children, goBack, isBackButtonEnabled = true, isHeaderEnabled = true, title }: LayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <LayoutContainer style={{ paddingBottom: Math.max(insets.bottom, 28) }}>
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LayoutContainer>
  );
}

export default Layout;
