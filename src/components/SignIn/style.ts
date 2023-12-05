import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.white};
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.black};
  font-size: ${(p) => p.theme.fontSizes.large};
  color: ${(p) => p.theme.colors.black};
  margin-bottom: 16px;
`;

export const Subtitle = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.gray};
  margin-bottom: 32px;
  text-align: center;
`;

export const SignInButton = styled.TouchableOpacity`
  background-color: ${(p) => p.theme.colors.white};
  padding: 12px 24px;
  border-radius: 30px;
  shadow-color: ${(p) => p.theme.colors.black};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

export const SignInButtonText = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.black};
`;

export const StyledLogo = styled.Image`
  width: 110px;
  height: 80px;
`;
