import styled from 'styled-components/native';

export const StyledText = styled.Text`
  color: ${(props) => props.theme.colors.text};
  font-family: ${(props) => props.theme.fonts.extraBold};
  font-size: ${(props) => props.theme.fontSizes.large};
`;

export const StyledView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.background};
`;

export const StyledButton = styled.Button`
  color: ${(props) => props.theme.colors.text};
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: ${(props) => props.theme.fontSizes.regular};
`;
