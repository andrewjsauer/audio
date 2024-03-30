import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
`;

export const ButtonWrapper = styled.View`
  justify-content: flex-end;
  margin: 10px 0;
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

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
`;
