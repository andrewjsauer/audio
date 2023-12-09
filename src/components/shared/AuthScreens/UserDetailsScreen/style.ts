import styled from 'styled-components/native';
import DatePicker from 'react-native-date-picker';

type ColorOptionProps = {
  color: string;
  isSelected: boolean;
};

export const ColorOption = styled.TouchableOpacity<ColorOptionProps>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: ${(props) => props.color};
  margin: 5px;
  border-width: ${(props) => (props.isSelected ? '2px' : '0px')};
  box-shadow: ${(props) =>
    props.isSelected ? `0px 0px 10px ${props.color}` : 'none'};
  elevation: ${(props) => (props.isSelected ? 3 : 0)};
`;

export const ColorPickerRow = styled.View`
  align-items: center;
  flex-direction: row;
`;

export const ColorPickerContainer = styled.View`
  justify-content: center;
  flex: 1;
`;

export const TextInput = styled.TextInput`
  font-size: ${(p) => p.theme.fontSizes.regular};
  font-family: ${(p) => p.theme.fonts.regular};
  border: 1px solid ${(p) => p.theme.colors.lightGray};
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  background-color: ${(p) => p.theme.colors.white};
`;

export const StyledDatePicker = styled(DatePicker)`
  width: 400px;
`;
