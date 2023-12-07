import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 30px;
`;

export const ButtonWrapper = styled.View`
  margin-top: 20px;
`;

export const PhoneTitle = styled.Text`
  margin-bottom: 10px;
  font-family: ${(p) => p.theme.fonts.semiBold};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const PhoneSubtitle = styled.Text`
  margin-top: 10px;
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const PhoneWrapper = styled.View`
  padding: 0 20px;
`;
