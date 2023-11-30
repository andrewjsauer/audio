import React from 'react';

import { View, StyledButton } from './style';

const ButtonContainer = (props: any) => (
  <View>
    <StyledButton {...props} />
  </View>
);

export default ButtonContainer;
