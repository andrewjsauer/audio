import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.transparentGray};
  justify-content: space-between;
  padding: 0 20px;
`;

export const Header = styled.View`
  align-items: center;
  margin-top: 120px;
`;

export const Footer = styled.View`
  align-items: center;
  margin-bottom: 60px;
`;

export const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xxlarge};
  font-family: ${(p) => p.theme.fonts.black};
`;

export const SubTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
  margin-bottom: 40px;
  margin-top: 4px;
`;

export const FooterTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.medium};
  font-family: ${(p) => p.theme.fonts.black};
`;

export const FooterSubTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xsmall};
  font-family: ${(p) => p.theme.fonts.regular};
  margin-bottom: 14px;
  margin-top: 10px;
  text-align: center;
`;

export const BenefitContainer = styled.View<{ noTopBorder: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  width: 100%;
  height: 72px;
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.lighterGray};

  ${(p) =>
    !p.noTopBorder &&
    `
    border-top-width: 1px;
    border-top-color: ${p.theme.colors.lighterGray};
  `}
`;

export const Benefit1Description = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
`;

export const Benefit1Item = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xlarge};
  font-family: ${(p) => p.theme.fonts.black};
  text-transform: uppercase;
`;

export const Benefit2Container = styled.View`
  flex-direction: column;
`;

export const Benefit2Item = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
`;

export const Benefit2Description = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
`;

export const Benefit2SubDescription = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.regular};
`;

export const RestoreButton = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.black};
  margin-top: 16px;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const RestoreButtonText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
`;
