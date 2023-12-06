/* eslint-disable no-nested-ternary */
import styled from 'styled-components/native';
import { StyledButtonProps } from './index';

export const ButtonContainer = styled.TouchableOpacity<StyledButtonProps>`
  border-radius: 30px;
  background-color: ${({ mode, disabled, theme }) =>
    disabled
      ? theme.colors.gray
      : mode === 'light'
        ? theme.colors.white
        : theme.colors.gray};
  align-items: center;
  justify-content: center;
  width: 320px;
  height: 60px;
`;

export const ButtonText = styled.Text<StyledButtonProps>`
  padding: 10px 20px;
  color: ${({ mode, disabled, theme }) =>
    disabled
      ? theme.colors.white
      : mode === 'light'
        ? theme.colors.black
        : theme.colors.white};
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: ${(props) => props.theme.fontSizes.large};
`;
