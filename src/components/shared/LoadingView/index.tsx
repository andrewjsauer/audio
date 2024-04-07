import React from 'react';
import { ActivityIndicator } from 'react-native';

import { StyledView } from './style';

function LoadingView() {
  return (
    <StyledView>
      <ActivityIndicator size="large" />
    </StyledView>
  );
}

export default LoadingView;
