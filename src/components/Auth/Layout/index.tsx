import React from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

import ChevronLeft from '@assets/icons/chevron-left.svg';
import GreenCheckIcon from '@assets/icons/green-check.svg';
import WaterDropIcon from '@assets/icons/water-drop.svg';
import StarIcon from '@assets/icons/star.svg';
import MicIcon from '@assets/icons/dark-mic.svg';

import {
  StatusContainer,
  StatusCircle,
  StatusItemContainer,
  StatusDivider,
  StatusText,
  KeyboardAvoidingView,
  Header,
  LayoutContainer,
  BackButton,
  View,
} from './style';

type LayoutProps = {
  children: React.ReactNode;
  goBack?: () => void;
  isBackArrowDisabled?: boolean;
  isHeaderEnabled?: boolean;
  isPartnershipComplete?: boolean;
  isTrialComplete?: boolean;
};

const getStatusIcon = (text: string, isPartnershipComplete: boolean, isTrialComplete: boolean) => {
  if (text === 'Personalize\nThe Partnership') {
    return isPartnershipComplete || isTrialComplete ? (
      <GreenCheckIcon width={40} height={40} />
    ) : (
      <WaterDropIcon width={20} height={20} />
    );
  }
  if (text.includes('Download')) {
    return <GreenCheckIcon width={40} height={40} />;
  }
  if (text.includes('Claim Your\n Free Trail')) {
    return isTrialComplete ? (
      <GreenCheckIcon width={40} height={40} />
    ) : (
      <StarIcon width={20} height={20} />
    );
  }
  if (text.includes('Reveal Your\n 1st Question!')) {
    return <MicIcon width={20} height={20} />;
  }

  return null;
};

function Layout({
  children,
  goBack,
  isBackArrowDisabled = true,
  isHeaderEnabled = true,
  isPartnershipComplete = false,
  isTrialComplete = false,
}: LayoutProps) {
  let header = null;

  if (isHeaderEnabled) {
    const statusAssets = [
      `Download\nDaily Q’s`,
      'Personalize\nThe Partnership',
      'Claim Your\n Free Trail',
      'Reveal Your\n 1st Question!',
    ];

    header = (
      <Header isAndroidMarginTop={Platform.OS !== 'ios'}>
        <BackButton
          disabled={isBackArrowDisabled}
          isDisabled={isBackArrowDisabled}
          onPress={goBack}
        >
          <ChevronLeft width={24} height={24} />
        </BackButton>
        <StatusContainer>
          <StatusDivider />
          {statusAssets.map((text, index) => (
            <StatusItemContainer key={text} isLastItem={index === statusAssets.length - 1}>
              <StatusCircle>
                {getStatusIcon(text, isPartnershipComplete, isTrialComplete)}
              </StatusCircle>
              <StatusText>{text}</StatusText>
            </StatusItemContainer>
          ))}
        </StatusContainer>
      </Header>
    );
  } else {
    header = null;
  }

  return (
    <LayoutContainer>
      {header}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LayoutContainer>
  );
}

export default Layout;
