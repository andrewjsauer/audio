import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: ${(p) => p.theme.colors.white};
`;

export const Header = styled.View`
  width: 100%;
  margin-top: 120px;
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
  margin-bottom: 14px;
`;

export const LegalContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px 0;
  width: 100%;
`;

export const LegalText = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const LegalButtonContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const FooterContainer = styled.View`
  width: 100%;
`;