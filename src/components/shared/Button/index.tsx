import React from 'react';
import { ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from 'styled-components/native';

import { ButtonContainer, ButtonText } from './style';

export interface StyledButtonProps
  extends Omit<TouchableOpacityProps, 'children'> {
  isDisabled?: boolean;
  isLoading?: boolean;
  mode?: 'light' | 'dark';
  text: string;
}

function StyledButton({
  isDisabled = false,
  isLoading = false,
  mode = 'dark',
  text,
  ...props
}: StyledButtonProps) {
  const theme = useTheme();

  return (
    <ButtonContainer disabled={isLoading || isDisabled} mode={mode} {...props}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors[mode === 'light' ? 'black' : 'white']}
        />
      ) : (
        <ButtonText mode={mode}>{text}</ButtonText>
      )}
    </ButtonContainer>
  );
}

export default StyledButton;
