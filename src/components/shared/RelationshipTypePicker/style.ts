import styled from 'styled-components/native';

export const RadioButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

export const RadioCircle = styled.View<{ checked: boolean }>`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.black};
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

export const RadioDot = styled.View`
  height: 10px;
  width: 10px;
  border-radius: 5px;
  background-color: ${(p) => p.theme.colors.black};
`;

export const Label = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.regular};
`;
