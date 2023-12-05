import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Layout, Message, Container } from './styles';

interface Props {
  resetState: () => void;
}

function FallbackScreen({ resetState }: Props) {
  const { t } = useTranslation();

  return (
    <Layout>
      <Container>
        <Message>{t('errors.whoops')}</Message>
        <Button title={t('errors.tryAgain')} onPress={resetState} />
      </Container>
    </Layout>
  );
}

export default FallbackScreen;
