import styled from 'styled-components/native';

export const ErrorText = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-family: ${(p) => p.theme.fonts.semiBold};
  font-size: ${(p) => p.theme.fontSizes.large};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ErrorContainer = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;
