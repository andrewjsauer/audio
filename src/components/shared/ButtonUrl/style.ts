import styled from 'styled-components/native';

export const ButtonText = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
  text-decoration: underline;
`;
