import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.transparentGray};
  justify-content: space-between;
  padding: 0 20px;
`;

export const Header = styled.View`
  align-items: center;
  margin-top: 20%;
`;

export const Footer = styled.View`
  align-items: center;
  margin-bottom: 30px;
`;

export const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xxlarge};
  font-family: ${(p) => p.theme.fonts.black};
`;

export const SubTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.black};
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
  height: 68px;
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
  font-family: ${(p) => p.theme.fonts.black};
  margin-left: 6px;
`;

export const Benefit1Item = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xlarge};
  font-family: ${(p) => p.theme.fonts.black};
  text-transform: uppercase;
`;

export const MonthlyText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.bold};
  margin-left: 6px;
`;

export const MonthlyPrice = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
  color: ${(p) => p.theme.colors.gray};
`;

export const Benefit2Container = styled.View`
  flex-direction: column;
`;

export const Benefit2Item = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.medium};
  font-family: ${(p) => p.theme.fonts.black};
`;

export const Benefit2Description = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.black};
  margin-left: 6px;
`;

export const Benefit2SubDescription = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xsmall};
  font-family: ${(p) => p.theme.fonts.regular};
  margin-left: 6px;
`;

export const RestoreButton = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.black};
  margin-top: 12px;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const RestoreButtonText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.bold};
`;

export const ColorCircle = styled.View<{ color: string; isSecond?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: ${(props) => props.color || '#BC5252'};
  border: 2px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;

  ${(p) =>
    p.isSecond &&
    `
    margin-left: -14px;
  `}
`;

export const ColorTextContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;
