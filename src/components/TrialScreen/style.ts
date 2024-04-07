import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
  padding: 0 20px;
`;

export const Header = styled.View`
  margin-top: 20px;
`;

export const Footer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.large};
  font-family: ${(p) => p.theme.fonts.extraBold};
`;

export const SubTitleContainer = styled.Text``;

export const SubTitle = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.regular};
  color: ${(p) => p.theme.colors.darkGray};
`;

export const SubTitlePrice = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.extraBold};
  color: ${(p) => p.theme.colors.lightGreen};
`;

export const SubTitleHighPrice = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.regular};
  text-decoration: line-through;
  color: ${(p) => p.theme.colors.darkGray};
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

export const RestoreButton = styled.TouchableOpacity`
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.black};
  margin-top: 12px;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const RestoreButtonText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.black};
`;

export const TrailBreakdownContainer = styled.View`
  margin-top: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 20px;
`;

export const Pill = styled.View`
  background-color: ${(p) => p.theme.colors.lightGreen};
  border-radius: 20px;
  height: 225px;
  width: 20px;
`;

export const BreakdownContainer = styled.View`
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export const DayContainer = styled.View<{ isMarginBottom?: boolean }>`
  ${(p) => p.isMarginBottom && 'margin-bottom: 24px;'}
  margin-left: 10px;
`;

export const DayText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.extraBold};
`;

export const DayDescriptionText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
  font-family: ${(p) => p.theme.fonts.regular};
`;
