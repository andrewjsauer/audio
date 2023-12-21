import React from 'react';
import { Container, WebViewStyled } from './style';

type Props = {
  route: {
    params: {
      url: string;
    };
  };
};

function BrowserScreen({ route }: Props) {
  return (
    <Container>
      <WebViewStyled
        source={{
          uri: route.params.url,
        }}
      />
    </Container>
  );
}

export default BrowserScreen;
