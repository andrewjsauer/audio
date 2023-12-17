import styled from 'styled-components/native';

export const StyledText = styled.Text`
  color: ${(p) => p.theme.colors.black};
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.large};
`;

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.theme.colors.white};
`;
