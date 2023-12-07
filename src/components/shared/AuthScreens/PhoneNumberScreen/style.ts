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

export const CodeInput = styled.TextInput.attrs((props) => ({
  placeholderTextColor: props.theme.colors.placeholder,
}))`
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  border-radius: 4px;
  padding: 15px;
  font-size: 16px;
  color: ${(p) => p.theme.colors.black};
  width: 100%;
  text-align: center;
`;

export const ResendCodeTextWrapper = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${(p) => p.theme.colors.lightGray};
`;

export const ResendCodeWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;
