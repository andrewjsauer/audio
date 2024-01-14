import styled from 'styled-components/native';
import { ButtonProps } from './index';

const buttonSizeStyles = {
  small: {
    width: '200px',
    height: '48px',
    fontSize: '14px',
  },
  medium: {
    width: '320px',
    height: '60px',
    fontSize: '18px',
  },
};

export const ButtonContainer = styled.TouchableOpacity<ButtonProps>`
  border-radius: 30px;
  background-color: ${({ mode, disabled, theme }) => {
    if (disabled) {
      if (mode === 'hidden') return theme.colors.transparentGray;
      return theme.colors.gray;
    }

    switch (mode) {
      case 'light':
        return theme.colors.white;
      case 'hidden':
        return theme.colors.transparentGray;
      case 'dark':
        return theme.colors.gray;
      case 'error':
        return theme.colors.burntOrange;
      default:
        return theme.colors.gray;
    }
  }};
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${({ size }) => size && buttonSizeStyles[size].width};
  height: ${({ size }) => size && buttonSizeStyles[size].height};
`;

export const ButtonText = styled.Text<ButtonProps>`
  color: ${({ mode, disabled, theme }) => {
    if (disabled) return theme.colors.white;

    switch (mode) {
      case 'light':
        return theme.colors.black;
      case 'hidden':
        return theme.colors.gray;
      case 'dark':
        return theme.colors.white;
      case 'error':
        return theme.colors.white;
      default:
        return theme.colors.black;
    }
  }};
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: ${(props) => buttonSizeStyles[props.size ?? 'medium'].fontSize};
`;

export const NotificationOrb = styled.View`
  position: absolute;
  top: -8px;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.theme.colors.red};
  border-radius: 10px;
  border: 3px solid white;
`;
