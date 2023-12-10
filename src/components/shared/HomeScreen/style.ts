import styled from 'styled-components/native';

export const StyledText = styled.Text`
  color: ${(p) => p.theme.colors.black};
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.large};
`;

export const StyledView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.theme.colors.white};
`;

export const StyledActivityIndicator = styled.ActivityIndicator``;

export const LogoutButton = styled.TouchableOpacity`
  position: absolute;
  top: 6%;
  right: 6%;
`;

export const ErrorText = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.medium};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;
