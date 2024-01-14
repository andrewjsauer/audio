import styled from 'styled-components/native';

export const Container = styled.View`
  margin: 0 8px;
  padding: 12px 18px;
  border-radius: 10px;
  flex-direction: column;
  background-color: ${(p) => p.theme.colors.green};
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.white};
`;

export const Description = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.white};
`;

export const ButtonWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`;

export const Button = styled.TouchableOpacity`
  border-radius: 30px;
  background-color: ${(p) => p.theme.colors.white};
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  padding: 6px 18px;
`;

export const ButtonText = styled.Text`
  color: ${(p) => p.theme.colors.green};
  font-family: ${(props) => props.theme.fonts.bold};
  font-size: ${(props) => props.theme.fontSizes.small};
`;
