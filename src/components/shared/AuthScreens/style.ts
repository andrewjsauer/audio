import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

export const ButtonWrapper = styled.View`
  margin-top: 20px;
`;

export const InputTitle = styled.Text`
  margin-bottom: 8px;
  font-family: ${(p) => p.theme.fonts.semiBold};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const InputSubtitle = styled.Text`
  margin-top: 8px;
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const InputWrapper = styled.View`
  padding: 0 20px;
  width: 100%;
`;
