import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppScreens } from '@lib/types';

import { ButtonText } from './style';

type ButtonURLProps = {
  url: string;
  children: string;
};

function ButtonURL({ url, children }: ButtonURLProps) {
  const navigation = useNavigation();

  const handlePress = () =>
    navigation.navigate(AppScreens.BrowserScreen, { url });

  return (
    <TouchableOpacity onPress={handlePress}>
      <ButtonText>{children}</ButtonText>
    </TouchableOpacity>
  );
}

export default memo(ButtonURL);
