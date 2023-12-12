/* eslint-disable no-nested-ternary */
import styled from 'styled-components/native';
import { ButtonProps } from './index';

const buttonSizeStyles = {
  small: {
    width: '140px',
    height: '40px',
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
    if (disabled) return theme.colors.gray;

    switch (mode) {
      case 'light':
        return theme.colors.white;
      case 'dark':
        return theme.colors.gray;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  }};
  align-items: center;
  justify-content: center;
  position: relative;

  ${({ size }) => size && buttonSizeStyles[size]};
`;

export const ButtonText = styled.Text<ButtonProps>`
  color: ${({ mode, disabled, theme }) =>
    disabled
      ? theme.colors.white
      : mode === 'light'
        ? theme.colors.black
        : theme.colors.white};
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
