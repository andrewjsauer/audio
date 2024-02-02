import React from 'react';

import Layout from '@components/shared/Layout';

import { WebViewStyled } from './style';

type Props = {
  route: {
    params: {
      url: string;
    };
  };
};

function BrowserScreen({ route }: Props) {
  return (
    <Layout titleKey="browserScreen.title" screen="Browser Screen">
      <WebViewStyled
        source={{
          uri: route.params.url,
        }}
      />
    </Layout>
  );
}

export default BrowserScreen;
