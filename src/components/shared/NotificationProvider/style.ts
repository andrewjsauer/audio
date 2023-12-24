import styled from 'styled-components/native';
import { Animated } from 'react-native';

type TypeProps = {
  type: 'error' | 'success' | 'warning' | 'info';
};

export const BaseContainer = styled.View`
  position: absolute;
  top: 10%;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnimatedContainer = Animated.createAnimatedComponent(BaseContainer);

export const Container = styled.View<TypeProps>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0 8px;
  border-radius: 10px;
  padding: 18px 20px;
  background-color: ${({ type, theme }) => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.white;
    }
  }};
`;

export const Content = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.white};
`;

export const Description = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.white};
`;

export const ButtonWrapper = styled.View`
  padding-left: 10px;
  flex-shrink: 0;
`;

export const Button = styled.TouchableOpacity`
  border-radius: 30px;
  background-color: ${(p) => p.theme.colors.white};
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text<TypeProps>`
  padding: 8px 24px;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.white;
    }
  }};
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: ${(props) => props.theme.fontSizes.small};
`;

export const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;
