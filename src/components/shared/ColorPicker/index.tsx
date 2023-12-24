import React from 'react';

import { ColorPickerRow, ColorPickerContainer, ColorOption } from './style';

const row1 = [
  '#175419',
  '#397729',
  '#62BE8D',
  '#82A326',
  '#BC5252',
  '#E27140',
  '#EBA741',
  '#F3CC03',
];
const row2 = [
  '#164780',
  '#1B6470',
  '#505883',
  '#937AC8',
  '#9C3D76',
  '#BD3C6A',
  '#D394E3',
  '#E1A3C8',
];

type ColorPickerType = {
  color?: string;
  onChange: (color: string) => void;
};

function ColorPicker({ color, onChange }: ColorPickerType) {
  return (
    <ColorPickerContainer>
      <ColorPickerRow>
        {row1.map((colorOption) => (
          <ColorOption
            key={colorOption}
            color={colorOption}
            isSelected={colorOption === color}
            onPress={() => onChange(colorOption)}
          />
        ))}
      </ColorPickerRow>
      <ColorPickerRow>
        {row2.map((colorOption) => (
          <ColorOption
            key={colorOption}
            color={colorOption}
            isSelected={colorOption === color}
            onPress={() => onChange(colorOption)}
          />
        ))}
      </ColorPickerRow>
    </ColorPickerContainer>
  );
}

export default ColorPicker;
