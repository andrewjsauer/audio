import styled from 'styled-components/native';
import DatePicker from 'react-native-date-picker';

export const TextInput = styled.TextInput`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.regular};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  background-color: ${(p) => p.theme.colors.white};
`;

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

export const RelationshipTypeContainer = styled.View`
  padding: 0 30px;
  width: 100%;
  flex: 1;
  justify-content: center;
`;

export const StyledDatePicker = styled(DatePicker)`
  width: 400px;
`;
