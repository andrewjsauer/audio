import styled from 'styled-components/native';

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
