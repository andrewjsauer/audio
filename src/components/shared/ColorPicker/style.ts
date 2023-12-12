import styled from 'styled-components/native';

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
