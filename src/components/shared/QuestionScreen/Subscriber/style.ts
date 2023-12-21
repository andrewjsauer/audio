import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
`;

export const ErrorText = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.medium};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ErrorContainer = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;
