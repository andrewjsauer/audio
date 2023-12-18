import styled from 'styled-components/native';

export const StyledView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.theme.colors.white};
`;

export const ErrorText = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.medium};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;
