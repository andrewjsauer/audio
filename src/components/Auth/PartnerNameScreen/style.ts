import styled from 'styled-components/native';

export const TextInput = styled.TextInput`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.regular};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  background-color: ${(p) => p.theme.colors.white};
`;
