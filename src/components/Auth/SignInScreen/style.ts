import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

export const BackgroundImage = styled.ImageBackground`
  position: absolute;
  flex: 1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export const LogoContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 60px;
`;

export const Header = styled.View`
  width: 100%;
  margin-top: 120px;
`;

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.logo};
  color: ${(p) => p.theme.colors.white};
  text-align: center;
`;

export const Subtitle = styled.Text`
  font-family: ${(p) => p.theme.fonts.semiBold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.white};
  text-align: center;
`;

export const SubtitleDescription = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.white};
  text-align: center;
  margin-top: -30px;
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
  color: ${(p) => p.theme.colors.white};
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
