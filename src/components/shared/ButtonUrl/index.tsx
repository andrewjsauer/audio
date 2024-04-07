import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppScreens } from '@lib/types';

import { ButtonText } from './style';

type ButtonURLProps = {
  url: string;
  children: string;
  isLightText?: boolean;
};

function ButtonURL({ url, children, isLightText = false }: ButtonURLProps) {
  const navigation = useNavigation();

  const handlePress = () => navigation.navigate(AppScreens.BrowserScreen, { url });

  return (
    <TouchableOpacity onPress={handlePress}>
      <ButtonText isLight={isLightText}>{children}</ButtonText>
    </TouchableOpacity>
  );
}

export default memo(ButtonURL);
