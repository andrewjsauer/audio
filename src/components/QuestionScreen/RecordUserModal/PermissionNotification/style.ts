import styled from 'styled-components/native';

export const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0 8px;
  padding: 12px 16px;
  border-radius: 10px;
  background-color: ${(p) => p.theme.colors.error};
`;

export const Content = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.white};
`;

export const Description = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.white};
`;

export const ButtonWrapper = styled.View`
  padding-left: 6px;
  flex-shrink: 0;
`;

export const Button = styled.TouchableOpacity`
  border-radius: 30px;
  background-color: ${(p) => p.theme.colors.white};
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text`
  padding: 8px 20px;
  color: ${(p) => p.theme.colors.error};
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.small};
`;
