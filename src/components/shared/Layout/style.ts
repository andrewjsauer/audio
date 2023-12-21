import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.white};
`;

export const BackButton = styled.TouchableOpacity`
  padding: 10px;
  flex: 1;
  align-items: flex-start;
  z-index: 1;
`;

export const Header = styled.View`
  flex-direction: row;
  margin: 10px 0;
  align-items: center;
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
  position: absolute;
  width: 100%;
  text-align: center;
`;
