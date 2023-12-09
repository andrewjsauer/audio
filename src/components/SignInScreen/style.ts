import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background-color: ${(p) => p.theme.colors.white};
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.extraBold};
  font-size: ${(p) => p.theme.fontSizes.logo};
  color: ${(p) => p.theme.colors.black};
  text-align: center;
`;

export const Subtitle = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.gray};
  text-align: center;
  margin-bottom: 10px;
`;

export const SubtitleDescription = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.gray};
  text-align: center;
`;

export const ButtonWrapper = styled.View`
  margin-bottom: -40px;
`;
