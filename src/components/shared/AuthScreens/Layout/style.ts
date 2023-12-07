import styled from 'styled-components/native';

export const LayoutContainer = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.white};
`;

export const BackButtonWrapper = styled.TouchableOpacity`
  margin-bottom: 20px;
`;

export const Header = styled.View`
  margin-top: 40px;
  padding: 10px;
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
  margin-left: 20px;
`;

export const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const View = styled.View`
  flex: 1;
`;
