import React from 'react';
import { ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from 'styled-components/native';

import { ButtonContainer, NotificationOrb, ButtonText } from './style';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  hasNotification?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  mode?: 'light' | 'dark' | 'error' | 'hidden';
  size?: 'small' | 'medium';
  text?: string;
}

function Button({
  hasNotification = false,
  isDisabled = false,
  isLoading = false,
  mode = 'dark',
  size = 'medium',
  text,
  ...props
}: ButtonProps) {
  const theme = useTheme();

  return (
    <ButtonContainer disabled={isLoading || isDisabled} mode={mode} size={size} {...props}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors[mode === 'light' || mode === 'hidden' ? 'black' : 'white']}
        />
      ) : (
        <>
          <ButtonText size={size} mode={mode}>
            {text}
          </ButtonText>
          {hasNotification && <NotificationOrb />}
        </>
      )}
    </ButtonContainer>
  );
}

export default Button;
