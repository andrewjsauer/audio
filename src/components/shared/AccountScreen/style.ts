import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  flex-direction: column;
  padding: 16px;
`;

export const OptionContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const OptionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

export const OptionTitle = styled.Text`
  font-family: ${(p) => p.theme.fonts.semiBold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.black};
`;

export const OptionName = styled.Text`
  font-family: ${(p) => p.theme.fonts.black};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.black};
  margin-right: 8px;
`;

export const OptionColor = styled.View<{ color: string }>`
  background-color: ${(p) => p.color};
  width: 30px;
  height: 30px;
  border-radius: 15px;
  margin-right: 8px;
`;

export const Footer = styled.View`
  align-items: center;
  padding: 16px 0;
`;

export const SignOutButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-top-color: ${(p) => p.theme.colors.lighterGray};
  border-bottom-color: ${(p) => p.theme.colors.lighterGray};
  width: 100%;
`;

export const SignOutText = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
`;

export const DeleteAccountButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  border-top-width: 1px;
  border-top-color: ${(p) => p.theme.colors.lighterGray};
  width: 100%;
`;

export const DeleteAccountText = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.red};
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
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const LegalButtonContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
`;
