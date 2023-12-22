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
  elevation: ${(props) => (props.isSelected ? 3 : 0)};
  border: ${(p) => (p.isSelected ? '3px solid rgba(255, 255, 255, 0.5)' : 'none')};
`;

export const ColorPickerRow = styled.View`
  align-items: center;
  flex-direction: row;
`;

export const ColorPickerContainer = styled.View`
  justify-content: center;
  flex: 1;
`;
