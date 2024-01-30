import React from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const paddingBottomValue = Platform.OS !== 'ios' ? 2 : 28;
  return (
    <LayoutContainer style={{ paddingBottom: Math.max(insets.bottom, paddingBottomValue) }}>
      {isHeaderEnabled && (
        <Header isAddedPadding={!isBackButtonEnabled} isAndroidMarginTop={Platform.OS !== 'ios'}>
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
